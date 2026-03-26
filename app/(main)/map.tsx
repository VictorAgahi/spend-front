import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { AppMap } from '../../src/components/organisms/AppMap';
import * as Location from 'expo-location';
import { RefreshCcw, LocateFixed } from 'lucide-react-native';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { GeolocationService } from '../../src/services/geolocation.service';
// import { TransactionPoint } from '@clement.pasteau/contracts';
import { colors, spacing } from '../../src/theme';

const REFRESH_COOLDOWN = 15000;

export default function Maps() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [trackedTransactions, setTrackedTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefreshAt, setNextRefreshAt] = useState(0);
  const mapRef = useRef<any>(null);
  const lastRequestTime = useRef(0);

  const fetchNearby = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRequestTime.current < REFRESH_COOLDOWN) {
      const remaining = Math.ceil((REFRESH_COOLDOWN - (now - lastRequestTime.current)) / 1000);
      Alert.alert('Cooling down', `Please wait ${remaining} seconds before refreshing again.`);
      return;
    }

    if (!location) return;

    setRefreshing(true);
    try {
      const response = await GeolocationService.getNearbyTransactions({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radiusKm: 10,
        tag: '',
      });
      setTrackedTransactions(response.transactions);
      lastRequestTime.current = now;
      setNextRefreshAt(now + REFRESH_COOLDOWN);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch nearby transactions');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for mapping.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Initial fetch handled by another useEffect once location is set
    })();
  }, []);

  useEffect(() => {
    if (location && trackedTransactions.length === 0 && loading) {
      fetchNearby(true);
    }
  }, [location]);

  const goToCurrentLocation = async () => {
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    mapRef.current?.animateToRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  if (loading && !location) {
    return (
      <Container style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="body" color={colors.textMuted} style={{ marginTop: spacing.md }}>
          Getting your location...
        </Typography>
      </Container>
    );
  }

  return (
    <View style={styles.container}>
      <AppMap
        mapRef={mapRef}
        location={location}
        markers={trackedTransactions}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Typography variant="h3" style={styles.title}>Map Tracker</Typography>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => fetchNearby()}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <RefreshCcw color={colors.white} size={24} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fab}
            onPress={goToCurrentLocation}
          >
            <LocateFixed color={colors.white} size={24} />
          </TouchableOpacity>
        </View>

        {Date.now() < nextRefreshAt && (
          <View style={styles.timerBubble}>
            <Typography variant="caption" color={colors.white}>
              Refreshing available in {Math.ceil((nextRefreshAt - Date.now()) / 1000)}s
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
    marginTop: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: spacing.md,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  title: {
    color: colors.white,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  timerBubble: {
    position: 'absolute',
    bottom: spacing.xxl + 40,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  }
});
