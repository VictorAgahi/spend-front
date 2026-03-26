import React from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { colors } from '../../theme';

interface AppMapProps {
  location: any;
  markers: any[];
  onRegionChange?: (region: any) => void;
  mapRef?: any;
}

export const AppMap: React.FC<AppMapProps> = ({ location, markers, onRegionChange, mapRef }) => {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: location?.coords.latitude || 48.8566,
        longitude: location?.coords.longitude || 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      mapType="none"
      onRegionChangeComplete={onRegionChange}
    >
      <UrlTile
        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />

      {location && (
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          pinColor={colors.primary}
        />
      )}

      {markers.map((tx) => (
        <Marker
          key={tx.transactionId}
          coordinate={{
            latitude: tx.latitude,
            longitude: tx.longitude,
          }}
          title={tx.name}
          description={`$${tx.amount.toFixed(2)} - ${tx.tag}`}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
