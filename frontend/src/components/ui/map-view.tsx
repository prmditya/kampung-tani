'use client';

import { useRef } from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  className?: string;
  height?: string;
  zoom?: number;
}

export function MapView({
  latitude,
  longitude,
  className = '',
  height = '200px',
  zoom = 14,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

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
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        interactive={true}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
      >
        <NavigationControl position="top-right" />

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
