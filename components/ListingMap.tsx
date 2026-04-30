'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';

type ReactLeaflet = typeof import('react-leaflet');

export function ListingMap({ listing }: { listing: Listing }) {
  const [mapModule, setMapModule] = useState<ReactLeaflet | null>(null);

  const [lat, lng] = listing.coords.split(',').map(Number);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import('leaflet'), import('react-leaflet')])
      .then(([L, RL]) => {
        if (cancelled) return;
        const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
        delete proto._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setMapModule(RL);
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  if (!lat || !lng) return null;

  if (!mapModule) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border h-44 bg-surface-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
            <MapPin size={16} className="text-accent-hover" strokeWidth={1.5} />
          </div>
          <p className="text-[12px] text-ink-600">Loading map…</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = mapModule;

  return (
    <div className="rounded-2xl overflow-hidden border border-border h-44 relative">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} />
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-900 shadow-soft pointer-events-none">
        {listing.street}
      </div>
    </div>
  );
}
