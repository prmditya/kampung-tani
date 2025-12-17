'use client';

import { useRef } from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import { useTheme } from 'next-themes';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  className?: string;
  height?: string;
  zoom?: number;
}

// Map style URLs - Using OpenFreeMap built-in styles (Mapbox-like design)
// positron: Clean light style similar to Mapbox Light
// liberty: Colorful style that works well for dark mode
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/liberty',
};

export function MapView({
  latitude,
  longitude,
  className = '',
  height = '200px',
  zoom = 14,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();

  // Select map style based on current theme
  const mapStyle =
    resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

  return (
    <div
      className={`relative w-full rounded-md overflow-hidden border border-input ${className}`}
      style={{ height }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          latitude,
          longitude,
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        projection={{ type: 'globe' }}
        interactive={true}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
        dragRotate={true}
        touchPitch={true}
        pitchWithRotate={true}
        onLoad={(e) => {
          const map = e.target;
          const style = map.getStyle();
          if (style && style.layers) {
            style.layers.forEach((layer) => {
              if (layer.type === 'fill-extrusion') {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
              }
            });
          }
        }}
      >
        <NavigationControl
          position="top-right"
          showCompass={true}
          visualizePitch={true}
        />

        <Marker latitude={latitude} longitude={longitude} anchor="center">
          {/* Minimalist marker design */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
              {/* Inner dot */}
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        </Marker>
      </Map>
    </div>
  );
}
