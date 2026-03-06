import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { ScreenHeader, ActionButton } from '@/components';
import { useRouter } from 'expo-router';
import { useWebSocketContext } from '@/infra/websocket/WebSocketProvider';
import { WsEvent } from '@/infra/websocket/types';
import { useWebSocket } from '@/infra/websocket/useWebSocket';

interface TransactionLocation {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  count: number;
  username: string;
  color: string;
}

const mockGeocode = (address: string) => {
  const lower = address.toLowerCase();
  if (lower.includes('paris')) return { lat: 48.8566, lng: 2.3522 };
  if (lower.includes('lyon')) return { lat: 45.7640, lng: 4.8357 };
  if (lower.includes('marseille')) return { lat: 43.2965, lng: 5.3698 };
  if (lower.includes('bordeaux')) return { lat: 44.8378, lng: -0.5792 };

  return {
    lat: 48.8566 + (Math.random() - 0.5) * 0.1,
    lng: 2.3522 + (Math.random() - 0.5) * 0.1
  };
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { currentRoom, username, userColor, emit } = useWebSocketContext();
  const [addressInput, setAddressInput] = useState('');
  const [transactions, setTransactions] = useState<TransactionLocation[]>([]);

  useEffect(() => {
    if (!currentRoom) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentRoom]);

  useWebSocket(WsEvent.MAP_TRANSACTION, (data) => {
    setTransactions(prev => {
      const existingIndex = prev.findIndex(t =>
        t.address.toLowerCase() === data.address.toLowerCase() && t.username === data.username
      );
      if (existingIndex > -1) {
        return prev.map((t, i) => i === existingIndex ? { ...t, count: t.count + 1 } : t);
      }
      return [...prev, { ...data, count: 1 }];
    });
  });

  useWebSocket(WsEvent.USER_LEFT_MAP, (data) => {
    setTransactions(prev => prev.filter(t => t.username !== data.username));
  });

  useWebSocket(WsEvent.MAP_CURRENT_STATE, (data) => {
    setTransactions(data);
  });

  const handleCreateTransaction = () => {
    if (!addressInput.trim() || !currentRoom) return;

    const coords = mockGeocode(addressInput);

    emit(WsEvent.MAP_TRANSACTION, {
      id: Math.random().toString(36).substr(2, 9),
      address: addressInput,
      latitude: coords.lat,
      longitude: coords.lng,
      username,
      color: userColor
    });

    setTransactions(prev => {
      const existingIndex = prev.findIndex(t =>
        t.address.toLowerCase() === addressInput.toLowerCase() && t.username === username
      );
      if (existingIndex > -1) {
        return prev.map((t, i) => i === existingIndex ? { ...t, count: t.count + 1 } : t);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        address: addressInput,
        latitude: coords.lat,
        longitude: coords.lng,
        count: 1,
        username,
        color: userColor
      }];
    });

    setAddressInput('');
    Keyboard.dismiss();
  };

  const totalTransactions = useMemo(() =>
    transactions.reduce((acc, curr) => acc + curr.count, 0),
    [transactions]);

  if (!currentRoom) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>Please join a room to view the live map.</Text>
        <ActionButton label="Go Back" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader
          title={`Hub: ${currentRoom}`}
          subtitle={`${totalTransactions} Live Transaction Zones`}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Spend at address..."
            value={addressInput}
            onChangeText={setAddressInput}
            placeholderTextColor="#a0a0a0"
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: userColor }, !addressInput && styles.addBtnDisabled]}
            onPress={handleCreateTransaction}
            disabled={!addressInput}
          >
            <Text style={styles.addBtnText}>Spend</Text>
          </TouchableOpacity>
        </View>

        <ActionButton
          label="Exit Map"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.backButton}
        />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.15,
          longitudeDelta: 0.1,
        }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
      >
        {transactions.map(loc => (
          <Circle
            key={`${loc.username}-${loc.address}`}
            center={{ latitude: loc.latitude, longitude: loc.longitude }}
            radius={100 + (loc.count * 200)}
            fillColor={`${loc.color}33`}
            strokeColor={loc.color}
            strokeWidth={1.5}
          />
        ))}
      </MapView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.statsOverlayContainer}
      >
        <View style={styles.statsOverlay}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsText}>Collective Impact</Text>
            <Text style={[styles.userBadge, { backgroundColor: userColor }]}>{username} (You)</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(totalTransactions * 10, 100)}%`, backgroundColor: userColor }]} />
          </View>
          <Text style={styles.helperText}>Transaction zones disappear when users leave the room.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const mapStyle = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e9e9e9" }, { "lightness": "17" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 14,
    color: '#2d3436',
    borderWidth: 1,
    borderColor: '#eee',
  },
  addBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
  },
  statsOverlayContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  statsOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userBadge: {
    fontSize: 10,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#dfe6e9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  helperText: {
    fontSize: 11,
    color: '#b2bec3',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff7675',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 30,
  }
});
