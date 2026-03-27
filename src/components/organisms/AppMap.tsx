import React from 'react';
import MapView, { Marker, UrlTile, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import {
  MapMode,
  TransactionPingedPayload,
  ZoneUpdatedPayload
} from '@clement.pasteau/shared';
import { GeocodingProvider } from '../../services/geocoding.config';

interface AppMapProps {
  location: any;
  markers: TransactionPingedPayload[];
  zones: ZoneUpdatedPayload[];
  mode: MapMode;
  onRegionChange?: (region: any) => void;
  mapRef?: any;
  geocodingProvider: GeocodingProvider;
}

export const AppMap: React.FC<AppMapProps> = ({
  location,
  markers,
  zones,
  mode,
  onRegionChange,
  mapRef,
  geocodingProvider
}) => {
  const isGoogle = geocodingProvider === GeocodingProvider.GOOGLE;

  return (
    <MapView
      ref={mapRef}
      provider={isGoogle ? PROVIDER_GOOGLE : undefined}
      style={[styles.map, { backgroundColor: mode === MapMode.HEATMAP ? '#0f172a' : '#ffffff' }]}
      initialRegion={{
        latitude: location?.coords.latitude || 48.8566,
        longitude: location?.coords.longitude || 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      mapType={isGoogle ? (mode === MapMode.HEATMAP ? 'terrain' : 'standard') : 'none'}
      loadingEnabled={true}
      loadingBackgroundColor={mode === MapMode.HEATMAP ? '#0f172a' : '#ffffff'}
      onRegionChangeComplete={onRegionChange}
    >
      {!isGoogle && (
        <UrlTile
          key={mode === MapMode.HEATMAP ? 'dark-tiles' : 'osm-tiles'}
          urlTemplate={mode === MapMode.HEATMAP
            ? "https://a.basemaps.cartocdn.com/{z}/{x}/{y}@2x.png"
            : "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          maximumZ={19}
          flipY={false}
        />
      )}

      {location && (
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Current Position"
          pinColor={colors.primary}
        />
      )}

      {mode === MapMode.INDIVIDUAL && markers.map((tx) => (
        <Marker
          key={tx.transactionId}
          coordinate={{
            latitude: tx.latitude,
            longitude: tx.longitude,
          }}
          title={`$${tx.amount.toFixed(2)}`}
          description={tx.tag}
        />
      ))}

      {mode === MapMode.WEIGHTED && zones.map((zone) => {
        const opacity = Math.min(0.15 + (zone.weight * 0.05), 0.6);
        const radius = zone.radius * (1 + (zone.weight * 0.08));
        const tagColor = zone.tag ? colors.tagColors[zone.tag] : colors.error;

        return (
          <Circle
            key={zone.id}
            center={{
              latitude: zone.latitude,
              longitude: zone.longitude,
            }}
            radius={radius}
            strokeWidth={0}
            strokeColor="transparent"
            fillColor={`${tagColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`}
          />
        );
      })}

      {mode === MapMode.HEATMAP && zones.map((zone) => {
        const interpolateSnapshotColor = (w: number) => {
          const stops = [
            { w: 0, r: 0, g: 229, b: 255 },
            { w: 8, r: 150, g: 255, b: 0 },
            { w: 22, r: 255, g: 145, b: 0 },
            { w: 50, r: 255, g: 60, b: 0 },
          ];

          if (w <= stops[0].w) return `rgb(${stops[0].r}, ${stops[0].g}, ${stops[0].b})`;
          if (w >= stops[3].w) return `rgb(${stops[3].r}, ${stops[3].g}, ${stops[3].b})`;

          let i = 0;
          while (w > stops[i + 1].w) i++;

          const s = stops[i];
          const e = stops[i + 1];
          const ratio = (w - s.w) / (e.w - s.w);

          const r = Math.round(s.r + (e.r - s.r) * ratio);
          const g = Math.round(s.g + (e.g - s.g) * ratio);
          const b = Math.round(s.b + (e.b - s.b) * ratio);

          return `rgb(${r}, ${g}, ${b})`;
        };

        const color = interpolateSnapshotColor(zone.weight);
        const baseRadius = zone.radius * 1.2;

        const toRgba = (rgb: string, alpha: number) => {
          const parts = rgb.match(/\d+/g);
          if (parts && parts.length === 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
          }
          return rgb;
        };

        return (
          <React.Fragment key={zone.id}>
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 8}
              fillColor={toRgba(color, 0.04)}
              strokeWidth={0}
              strokeColor="transparent"
            />
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 5}
              fillColor={toRgba(color, 0.08)}
              strokeWidth={0}
              strokeColor="transparent"
            />
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 3}
              fillColor={toRgba(color, 0.12)}
              strokeWidth={0}
              strokeColor="transparent"
            />
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 1.8}
              fillColor={toRgba(color, 0.18)}
              strokeWidth={0}
              strokeColor="transparent"
            />
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 0.9}
              fillColor={toRgba(color, 0.25)}
              strokeWidth={0}
              strokeColor="transparent"
            />
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={baseRadius * 0.4}
              fillColor={toRgba(color, 0.40)} strokeWidth={0}
              strokeColor="transparent"
            />
          </React.Fragment>
        );
      })}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
