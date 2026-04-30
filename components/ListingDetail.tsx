'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bookmark, Calendar, Check, MapPin } from 'lucide-react';
import { fmtCHF } from '@/lib/format';
import { likeListingApi } from '@/lib/api/applications-client';
import type { Listing } from '@/lib/types';

export function ListingDetail({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [photoIdx, setPhotoIdx] = useState(0);

  const back = () => router.back();

  const apply = () => {
    likeListingApi(listing.id).catch(console.error);
    router.push('/status');
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col pb-28">
      <div className="relative w-full aspect-[4/3] bg-surface-soft overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.photos[photoIdx]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-3 left-0 right-0 px-4 flex gap-1">
          {listing.photos.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i === photoIdx ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))}
          className="absolute left-0 top-0 bottom-0 w-1/3"
          aria-label="Previous photo"
        />
        <button
          type="button"
          onClick={() => setPhotoIdx((i) => Math.min(listing.photos.length - 1, i + 1))}
          className="absolute right-0 top-0 bottom-0 w-1/3"
          aria-label="Next photo"
        />
        <button
          type="button"
          onClick={back}
          className="absolute top-[max(env(safe-area-inset-top),16px)] left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sheet"
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="absolute top-[max(env(safe-area-inset-top),16px)] right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sheet"
          aria-label="Save"
        >
          <Bookmark size={18} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center gap-1.5 text-ink-600 text-[13px] mb-1.5">
          <MapPin size={14} className="text-ink-400" strokeWidth={1.5} />
          <span className="font-medium">{listing.neighborhood}</span>
          <span className="text-ink-400">·</span>
          <span>{listing.street}</span>
        </div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900 leading-tight mb-4">
          {listing.title}
        </h1>

        <Section title="At a glance">
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Rooms" value={listing.rooms} />
            <Stat label="Size" value={`${listing.sqm} m²`} />
            <Stat label="Price" value={fmtCHF(listing.price)} sub="/ month" />
            <Stat label="Floor" value={listing.floor} />
            <Stat label="Built" value={listing.year} />
            <Stat label="From HB" value={listing.distance} />
          </div>
        </Section>

        <Section title="Features">
          <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {listing.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-[15px] text-ink-900"
              >
                <span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={3} className="text-accent-hover" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="About this place">
          <p className="text-[15px] text-ink-900 leading-relaxed">{listing.note}</p>
        </Section>

        <Section title="Where it is">
          <div className="rounded-2xl overflow-hidden border border-border h-44 relative bg-surface-soft">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <rect width="400" height="200" fill="#F2F4F7" />
              <path
                d="M 0 130 Q 80 145 160 130 Q 240 115 320 135 Q 400 155 400 200 L 0 200 Z"
                fill="#DDE9F4"
              />
              {[40, 90, 150, 220, 290].map((y, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y + (i % 2 ? -10 : 5)}
                  stroke="#E6E8EB"
                  strokeWidth="1.5"
                />
              ))}
              {[60, 130, 200, 280, 350].map((x, i) => (
                <line
                  key={`v${i}`}
                  x1={x}
                  y1="0"
                  x2={x + (i % 2 ? 10 : -5)}
                  y2="200"
                  stroke="#E6E8EB"
                  strokeWidth="1.5"
                />
              ))}
              {[
                [70, 50, 40, 30],
                [150, 30, 50, 35],
                [230, 55, 55, 30],
                [310, 40, 40, 40],
                [80, 150, 55, 30],
                [180, 160, 60, 25],
              ].map(([x, y, w, h], i) => (
                <rect
                  key={`b${i}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="#FFFFFF"
                  stroke="#E6E8EB"
                />
              ))}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-warm border-[3px] border-white shadow-sheet" />
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-warm rotate-45 -z-10" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-900 shadow-soft">
              {listing.street}
            </div>
          </div>
        </Section>

        <Section title="Availability">
          <div className="flex items-center gap-3 bg-surface-soft rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center">
              <Calendar size={18} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-medium text-ink-900">
                Available from {listing.available}
              </p>
              <p className="text-[13px] text-ink-600">{listing.duration}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-md mx-auto bg-white border-t border-border px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={back}
              className="text-ink-600 text-[15px] font-medium px-4 h-12 active:opacity-60"
            >
              Pass
            </button>
            <button
              type="button"
              onClick={apply}
              className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-full h-12 font-medium active:scale-[0.98] transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-7">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-400 mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-400 font-medium mb-1">
        {label}
      </p>
      <p className="text-[15px] font-semibold text-ink-900 leading-tight">
        {value}
        {sub && <span className="text-ink-400 font-normal text-[12px]"> {sub}</span>}
      </p>
    </div>
  );
}
