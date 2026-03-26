import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Map, Marker } from 'pigeon-maps';
import { colors } from '../../theme';

interface AppMapProps {
  location: any;
  markers: any[];
  onRegionChange?: (region: any) => void;
  mapRef?: any;
}

export const AppMap = ({ location, markers }: AppMapProps) => {
  const center: [number, number] = location
    ? [location.coords.latitude, location.coords.longitude]
    : [48.8566, 2.3522];

  return (
    <View style={styles.container}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
      >
        {location && (
          <Marker
            width={50}
            anchor={center}
            color={colors.primary}
          />
        )}

        {markers.map((tx) => (
          <Marker
            key={tx.transactionId}
            width={40}
            anchor={[tx.latitude, tx.longitude]}
            color={colors.secondary}
          />
        ))}
      </Map>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
