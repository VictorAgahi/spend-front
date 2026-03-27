import axios from 'axios';
import { geocodingConfig, GeocodingProvider } from './geocoding.config';

export interface AddressSuggestion {
  display_name: string;
  lat?: string;
  lon?: string;
  place_id: string | number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

const searchCache = new Map<string, { data: AddressSuggestion[], time: number }>();
const CACHE_TTL = 300000;
let lastCallTime = 0;
const MIN_INTERVAL = 800;
let pendingQuery: string | null = null;
let pendingPromise: Promise<AddressSuggestion[]> | null = null;

export const AddressService = {
  getApiKey(): string {
    return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  },

  async search(query: string): Promise<AddressSuggestion[]> {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 3) return [];

    const cached = searchCache.get(trimmedQuery);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }

    if (pendingQuery === trimmedQuery && pendingPromise) {
      return pendingPromise;
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < MIN_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall));
    }

    const provider = geocodingConfig.getProvider();

    const performActualSearch = async () => {
      lastCallTime = Date.now();
      pendingQuery = trimmedQuery;

      try {
        let results: AddressSuggestion[] = [];
        if (provider === GeocodingProvider.GOOGLE && this.getApiKey()) {
          results = await this.searchGoogle(trimmedQuery);
        } else {
          results = await this.searchOSM(trimmedQuery);
        }

        searchCache.set(trimmedQuery, { data: results, time: Date.now() });
        return results;
      } finally {
        pendingQuery = null;
        pendingPromise = null;
      }
    };

    pendingPromise = performActualSearch();
    return pendingPromise;
  },

  async searchOSM(query: string): Promise<AddressSuggestion[]> {
    const now = Date.now();
    const waitTime = 1000 - (now - lastCallTime);
    if (waitTime > 0) await new Promise(resolve => setTimeout(resolve, waitTime));
    lastCallTime = Date.now();

    try {
      const response = await axios.get<AddressSuggestion[]>(NOMINATIM_URL, {
        params: { q: query, format: 'json', addressdetails: 1, limit: 5 },
        headers: { 'Accept-Language': 'en', 'User-Agent': 'SpendApp-FrontEnd' }
      });
      return response.data;
    } catch (error) {
      console.error('Nominatim error:', error);
      return [];
    }
  },

  async searchGoogle(query: string): Promise<AddressSuggestion[]> {
    const apiKey = this.getApiKey();

    try {
      const response = await axios.get(GOOGLE_PLACES_URL, {
        params: {
          input: query,
          key: apiKey,
          types: 'address',
          language: 'en'
        }
      });

      if (response.data.status !== 'OK') {
        if (response.data.status === 'ZERO_RESULTS') return [];
        throw new Error(`Google Places API Error: ${response.data.status}`);
      }

      return response.data.predictions.map((p: any) => ({
        display_name: p.description,
        place_id: p.place_id,
      }));
    } catch (error) {
      console.error('Google Search error:', error);
      return this.searchOSM(query);
    }
  }
};
