import { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { AppMap } from '../../src/components/organisms/AppMap';
import * as Location from 'expo-location';
import { RefreshCcw, LocateFixed, Map as MapIcon, Layers, Flame, Plus } from 'lucide-react-native';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { GeolocationService } from '../../src/services/geolocation.service';
import {
  MapMode,
  TransactionPingedPayload,
  ZoneUpdatedPayload
} from '@clement.pasteau/shared';
import { colors, spacing } from '../../src/theme';
import { useWebSocket } from '../../src/infra/websocket/useWebSocket';
import { WsEvent } from '../../src/infra/websocket/types';
import { geocodingConfig, GeocodingProvider } from '../../src/services/geocoding.config';
import { Shield, ShieldAlert } from 'lucide-react-native';


const REFRESH_COOLDOWN = 15000;

const TAG_KEYS = Object.keys(colors.tagColors);

export default function Maps() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mode, setMode] = useState<MapMode>(MapMode.INDIVIDUAL);
  const [trackedTransactions, setTrackedTransactions] = useState<TransactionPingedPayload[]>([]);
  const [zones, setZones] = useState<ZoneUpdatedPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const lastRequestTime = useRef(0);
  const [isPinging, setIsPinging] = useState(false);
  const [provider, setProvider] = useState<GeocodingProvider>(geocodingConfig.getProvider());

  useEffect(() => {
    geocodingConfig.init().then(() => {
      setProvider(geocodingConfig.getProvider());
    });
  }, []);

  const toggleGeocodingProvider = async () => {
    await geocodingConfig.toggleProvider();
    const newProvider = geocodingConfig.getProvider();
    setProvider(newProvider);
    Alert.alert('Provider Switched', `Now using ${newProvider} strategy.`);
  };


  const pingRandomTransaction = async () => {
    if (!location) return;
    setIsPinging(true);
    try {
      const demoNames = ['Coffee', 'Lunch', 'Grocery', 'Taxi', 'Cinema', 'Beer'];
      const tags = ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'OTHER'];
      const name = demoNames[Math.floor(Math.random() * demoNames.length)];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      const amount = Math.floor(Math.random() * 50) + 5;

      await GeolocationService.trackTransaction({
        transactionId: `demo-${Date.now()}`,
        userId: 'demo-user',
        address: 'Rue de Tolbiac, Paris',
        amount,
        tag,
        provider // Utilisation du provider dynamique (Kill Switch)
      });

      setTimeout(() => fetchEverything(true), 1000);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to ping transaction');
    } finally {
      setIsPinging(false);
    }
  };


  useWebSocket(WsEvent.ZONE_UPDATE, useCallback((newZone) => {
    setZones(prev => {
      const index = prev.findIndex(z => z.id === newZone.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = newZone;
        return next;
      }
      return [...prev, newZone];
    });
  }, []));

  useWebSocket(WsEvent.TRANSACTION_PING, useCallback((ping) => {
    setTrackedTransactions(prev => {
      if (prev.some(t => t.transactionId === ping.transactionId)) return prev;
      return [ping, ...prev];
    });
  }, []));

  const fetchEverything = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRequestTime.current < REFRESH_COOLDOWN) {
      const remaining = Math.ceil((REFRESH_COOLDOWN - (now - lastRequestTime.current)) / 1000);
      Alert.alert('Cooling down', `Please wait ${remaining} seconds.`);
      return;
    }

    if (!location) return;

    setRefreshing(true);
    try {
      const txResponse = await GeolocationService.getNearbyTransactions({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radiusKm: 10,
        tag: selectedTag || '',
      });
      setTrackedTransactions(txResponse.transactions as any);

      const zonesResponse = await GeolocationService.getMapZones({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radiusKm: 50,
        tag: selectedTag || '',
      });
      setZones(zonesResponse.zones);

      lastRequestTime.current = now;
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update map metadata');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location && loading) {
      fetchEverything(true);
    }
  }, [location]);

  useEffect(() => {
    if (location && !loading) {
      fetchEverything(true);
    }
  }, [selectedTag]);

  const goToCurrentLocation = async () => {
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    mapRef.current?.animateToRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  if (loading && !location) {
    return (
      <Container style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="body" color={colors.textMuted} style={{ marginTop: spacing.md }}>
          Syncing with satellite...
        </Typography>
      </Container>
    );
  }

  return (
    <View style={styles.container}>
      <AppMap
        mapRef={mapRef}
        location={location}
        mode={mode}
        markers={trackedTransactions}
        zones={zones}
        geocodingProvider={provider}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Typography variant="h3" style={styles.title}>
            {mode === MapMode.INDIVIDUAL ? 'Personal Pings' : mode === MapMode.WEIGHTED ? 'Community Zones' : 'Activity Heatmap'}
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Real-time synchronization active
          </Typography>
        </View>

        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === MapMode.INDIVIDUAL && styles.activeMode]}
            onPress={() => setMode(MapMode.INDIVIDUAL)}
          >
            <LocateFixed size={20} color={mode === MapMode.INDIVIDUAL ? colors.white : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === MapMode.WEIGHTED && styles.activeMode]}
            onPress={() => setMode(MapMode.WEIGHTED)}
          >
            <Layers size={20} color={mode === MapMode.WEIGHTED ? colors.white : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === MapMode.HEATMAP && styles.activeMode]}
            onPress={() => setMode(MapMode.HEATMAP)}
          >
            <Flame size={20} color={mode === MapMode.HEATMAP ? colors.white : colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.modeButton, provider === GeocodingProvider.GOOGLE && { backgroundColor: colors.warning }]}
            onPress={toggleGeocodingProvider}
          >
            {provider === GeocodingProvider.OSM ? (
              <Shield size={20} color={colors.textMuted} />
            ) : (
              <ShieldAlert size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>


        <View style={styles.tagFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScrollContent}>
            <TouchableOpacity
              style={[styles.tagBadge, !selectedTag && styles.activeTagBadge]}
              onPress={() => setSelectedTag(null)}
            >
              <Typography variant="caption" color={!selectedTag ? colors.white : colors.textMuted}>
                All
              </Typography>
            </TouchableOpacity>
            {TAG_KEYS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagBadge, selectedTag === tag && styles.activeTagBadge]}
                onPress={() => setSelectedTag(tag)}
              >
                <View style={[styles.colorDot, { backgroundColor: colors.tagColors[tag] }]} />
                <Typography variant="caption" color={selectedTag === tag ? colors.white : colors.textMuted}>
                  {tag}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => fetchEverything()}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <RefreshCcw color={colors.white} size={24} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.secondary }]}
            onPress={pingRandomTransaction}
            disabled={isPinging}
          >
            {isPinging ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Plus color={colors.white} size={24} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabSecondary}
            onPress={goToCurrentLocation}
          >
            <MapIcon color={colors.white} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.lg,
    pointerEvents: 'box-none',
  },
  topBar: {
    marginTop: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: spacing.md,
    borderRadius: 16,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.white,
  },
  tagFilterContainer: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  tagScrollContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTagBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeToggleContainer: {
    position: 'absolute',
    top: 190,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeMode: {
    backgroundColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  actionButtons: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.md,
  },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabSecondary: {
    backgroundColor: colors.surface,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
  }
});
