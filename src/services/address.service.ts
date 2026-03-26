import axios from 'axios';

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
let lastRequestTime = 0;
const MIN_INTERVAL = 1000;

export const AddressService = {
  async search(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 3) return [];

    const now = Date.now();
    const waitTime = MIN_INTERVAL - (now - lastRequestTime);

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();

    try {
      const response = await axios.get<AddressSuggestion[]>(NOMINATIM_URL, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SpendApp-FrontEnd'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Nominatim error:', error);
      return [];
    }
  }
};
