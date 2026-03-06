import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useWebSocket } from '../infra/websocket/useWebSocket';
import { useWebSocketContext } from '../infra/websocket/WebSocketProvider';
import { WsEvent, GeolocationPingPayload } from '../infra/websocket/types';

export const PingNotification: React.FC = () => {
  const { isConnected } = useWebSocketContext();
  const [lastPing, setLastPing] = useState<GeolocationPingPayload | null>(null);
  const [opacity] = useState(new Animated.Value(0));
  const [count, setCount] = useState(0);

  useWebSocket(WsEvent.PING_FROM_GEOLOC, (data) => {
    setLastPing(data);
    setCount((prev) => prev + 1);

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  });

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
      </View>

      <Animated.View style={[styles.notification, { opacity }]}>
        {lastPing && (
          <View>
            <Text style={styles.title}>📍 Geolocation Ping</Text>
            <Text style={styles.message}>{lastPing.message}</Text>
            <Text style={styles.timestamp}>{new Date(lastPing.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      </Animated.View>
      <Text>{count}</Text>

      {!lastPing && isConnected && (
        <Text style={styles.waitingText}>Waiting for geolocation events...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notification: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#1565C0',
  },
  timestamp: {
    fontSize: 10,
    color: '#64B5F6',
    marginTop: 6,
    fontStyle: 'italic',
  },
  waitingText: {
    fontSize: 13,
    color: '#9e9e9e',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
