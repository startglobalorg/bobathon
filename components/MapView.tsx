'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getListings } from '@/lib/api/listings-client';
import { fmtCHF } from '@/lib/format';
import type { Listing } from '@/lib/types';

type ReactLeaflet = typeof import('react-leaflet');

// Zürich centre
const CENTER: [number, number] = [47.3769, 8.5417];
const ZOOM = 12;

export function MapView() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [mapModule, setMapModule] = useState<ReactLeaflet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([import('leaflet'), import('react-leaflet')])
      .then(([L, ReactLeaflet]) => {
        if (cancelled) return;
        const proto = L.Icon.Default.prototype as unknown as {
          _getIconUrl?: unknown;
        };
        delete proto._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setMapModule(ReactLeaflet);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load map');
      });

    getListings().then((data) => {
      if (!cancelled) setListings(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const openListing = (id: string) => {
    router.push(`/listing/${id}`);
  };

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <div className="text-center px-5">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <MapPin size={24} className="text-red-600" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] text-ink-900 font-semibold mb-2">Map Error</p>
          <p className="text-[13px] text-ink-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapModule) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-3">
            <MapPin size={24} className="text-accent-hover" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] text-ink-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = mapModule;

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between bg-white border-b border-border sticky top-0 z-[1000]">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink-900">
          Map View
        </h1>
        <span className="text-[13px] text-ink-600">
          {listings.length} listings
        </span>
      </header>

      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {listings.map((listing) => {
            const [lat, lng] = listing.coords.split(',').map(Number);
            if (!lat || !lng) return null;

            return (
              <Marker key={listing.id} position={[lat, lng]}>
                <Popup>
                  <button
                    type="button"
                    onClick={() => openListing(listing.id)}
                    className="text-left"
                  >
                    <div className="min-w-[200px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <p className="text-[14px] font-semibold text-ink-900 mb-1">
                        {listing.title}
                      </p>
                      <p className="text-[12px] text-ink-600 mb-1">
                        {listing.neighborhood}
                      </p>
                      <p className="text-[13px] font-semibold text-accent">
                        {fmtCHF(listing.price)}/mo
                      </p>
                      <p className="text-[12px] text-ink-600 mt-1">
                        {listing.rooms} rooms · {listing.sqm} m²
                      </p>
                      <p className="text-[12px] text-accent-hover font-medium mt-2">
                        View details →
                      </p>
                    </div>
                  </button>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
