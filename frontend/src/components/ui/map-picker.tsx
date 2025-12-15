'use client';

import { useCallback, useRef } from 'react';
import Map, {
  Marker,
  NavigationControl,
  MapRef,
  MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import { useTheme } from 'next-themes';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapPickerProps {
  value?: { latitude: number; longitude: number } | null;
  onChange?: (coords: { latitude: number; longitude: number } | null) => void;
  disabled?: boolean;
  className?: string;
}

// Default center on Indonesia
const DEFAULT_CENTER = {
  latitude: -6.2088, // Jakarta
  longitude: 106.8456,
};

const DEFAULT_ZOOM = 10;

// Map style URLs - Using OpenFreeMap built-in styles (Mapbox-like design)
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/liberty',
};

export function MapPicker({
  value,
  onChange,
  disabled = false,
  className = '',
}: MapPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();

  // Select map style based on current theme
  const mapStyle =
    resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

  // Use value directly - fully controlled component
  const marker = value || null;

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (disabled) return;

      const { lng, lat } = event.lngLat;
      const newCoords = { latitude: lat, longitude: lng };
      onChange?.(newCoords);
    },
    [disabled, onChange],
  );

  const handleRemoveMarker = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  // Calculate initial view state based on value or default
  const initialViewState = {
    latitude: value?.latitude || DEFAULT_CENTER.latitude,
    longitude: value?.longitude || DEFAULT_CENTER.longitude,
    zoom: value ? 14 : DEFAULT_ZOOM,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative w-full h-[250px] rounded-md overflow-hidden border border-input ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
        }`}
      >
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          projection={{ type: 'globe' }}
          onClick={handleMapClick}
          dragPan={!disabled}
          scrollZoom={!disabled}
          doubleClickZoom={!disabled}
        >
          <NavigationControl position="top-right" />

          {marker && (
            <Marker
              latitude={marker.latitude}
              longitude={marker.longitude}
              anchor="center"
            >
              {/* Minimalist marker design */}
              <div className="relative">
                {/* Outer ring */}
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                  {/* Inner dot */}
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                {/* Pulse animation */}
                <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-primary animate-ping opacity-30" />
              </div>
            </Marker>
          )}

          {/* Empty state overlay when no marker */}
          {!marker && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Click to set location
                </p>
              </div>
            </div>
          )}
        </Map>
      </div>

      {/* Coordinate display and remove button */}
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex gap-4 text-muted-foreground">
          <span>
            <strong>Lat:</strong> {marker?.latitude?.toFixed(6) || '-'}
          </span>
          <span>
            <strong>Lng:</strong> {marker?.longitude?.toFixed(6) || '-'}
          </span>
        </div>

        {marker && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemoveMarker}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
