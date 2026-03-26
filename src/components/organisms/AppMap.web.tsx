import { View, StyleSheet } from 'react-native';
import { Map, Marker } from 'pigeon-maps';
import { colors } from '../../theme';
import {
  MapMode,
  TransactionPingedPayload,
  ZoneUpdatedPayload
} from '@clement.pasteau/shared';

interface AppMapProps {
  location: any;
  markers: TransactionPingedPayload[];
  zones: ZoneUpdatedPayload[];
  mode: MapMode;
  onRegionChange?: (region: any) => void;
  mapRef?: any;
}

export const AppMap = ({ location, markers, zones, mode }: AppMapProps) => {
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

        {mode === MapMode.INDIVIDUAL && markers.map((tx) => (
          <Marker
            key={tx.transactionId}
            width={40}
            anchor={[tx.latitude, tx.longitude]}
            color={colors.secondary}
          />
        ))}

        {mode === MapMode.WEIGHTED && zones.map((zone) => {
          const baseSize = 40;
          const size = baseSize + (zone.weight * 5);
          const opacity = Math.min(0.2 + (zone.weight * 0.05), 0.5);
          const tagColor = zone.tag ? colors.tagColors[zone.tag] : colors.error;

          const hex = tagColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          return (
            <Marker
              key={zone.id}
              width={size}
              anchor={[zone.latitude, zone.longitude]}
              color={`rgba(${r}, ${g}, ${b}, ${opacity})`}
            />
          );
        })}
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
