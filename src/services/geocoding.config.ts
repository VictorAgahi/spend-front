import AsyncStorage from '@react-native-async-storage/async-storage';

export enum GeocodingProvider {
  OSM = 'OpenStreetMap',
  GOOGLE = 'GoogleMaps'
}

const STORAGE_KEY = '@geocoding_provider';

class GeocodingConfig {
  private currentProvider: GeocodingProvider = GeocodingProvider.OSM;

  async init() {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === GeocodingProvider.GOOGLE) {
      this.currentProvider = GeocodingProvider.GOOGLE;
    }
  }

  getProvider(): GeocodingProvider {
    return this.currentProvider;
  }

  async setProvider(provider: GeocodingProvider) {
    this.currentProvider = provider;
    await AsyncStorage.setItem(STORAGE_KEY, provider);
  }

  toggleProvider() {
    const next = this.currentProvider === GeocodingProvider.OSM 
      ? GeocodingProvider.GOOGLE 
      : GeocodingProvider.OSM;
    return this.setProvider(next);
  }
}

export const geocodingConfig = new GeocodingConfig();
