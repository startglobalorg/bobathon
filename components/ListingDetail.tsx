'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Bookmark, Calendar, Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { ListingMap } from './ListingMap';
import { fmtCHF } from '@/lib/format';
import { getApplications, likeListingApi } from '@/lib/api/applications-client';
import { useAppStore } from '@/lib/store';
import type { Listing } from '@/lib/types';

const BOOKMARKS_KEY = 'apartner.bookmarks.v1';

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed.filter((x) => typeof x === 'string') as string[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
}

export function ListingDetail({ listing }: { listing: Listing }) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPulse, setBookmarkPulse] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setBookmarked(readBookmarks().includes(listing.id));
  }, [listing.id]);

  useEffect(() => {
    let cancelled = false;
    getApplications()
      .then((apps) => {
        if (cancelled) return;
        setHasApplied(apps.some((a) => a.listingId === listing.id));
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const back = () => router.back();

  const toggleBookmark = () => {
    const current = readBookmarks();
    const isOn = current.includes(listing.id);
    const next = isOn ? current.filter((id) => id !== listing.id) : [...current, listing.id];
    writeBookmarks(next);
    setBookmarked(!isOn);
    setBookmarkPulse(true);
    setTimeout(() => setBookmarkPulse(false), 220);
    showToast(isOn ? 'Removed from saved' : 'Saved for later', 1600);
  };

  const apply = async () => {
    if (hasApplied || applying) return;
    setApplying(true);
    try {
      await likeListingApi(listing.id);
      setHasApplied(true);
      router.push('/status');
    } catch (err) {
      console.error(err);
      setApplying(false);
    }
  };

  const goPrev = () => setPhotoIdx((i) => Math.max(0, i - 1));
  const goNext = () => setPhotoIdx((i) => Math.min(listing.photos.length - 1, i + 1));
  const hasPrev = photoIdx > 0;
  const hasNext = photoIdx < listing.photos.length - 1;

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col pb-28">
      <div className="relative w-full aspect-[4/3] bg-surface-soft overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.photos[photoIdx]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft top mask so chrome reads on bright photos */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-0 right-0 px-4 flex gap-1">
          {listing.photos.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full bg-white/40 overflow-hidden"
            >
              <div
                className="h-full bg-white transition-[width] duration-300 ease-out-strong"
                style={{ width: i === photoIdx ? '100%' : i < photoIdx ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-0 top-0 bottom-0 w-1/2"
        />
        <button
          type="button"
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-0 top-0 bottom-0 w-1/2"
        />

        {hasPrev && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center pointer-events-none">
            <ChevronLeft size={18} strokeWidth={2} />
          </div>
        )}
        {hasNext && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center pointer-events-none">
            <ChevronRight size={18} strokeWidth={2} />
          </div>
        )}

        <button
          type="button"
          onClick={back}
          className="absolute top-[max(env(safe-area-inset-top),16px)] left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sheet active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={toggleBookmark}
          className="absolute top-[max(env(safe-area-inset-top),16px)] right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sheet active:scale-90 transition-transform"
          aria-label={bookmarked ? 'Remove from saved' : 'Save'}
          aria-pressed={bookmarked}
        >
          <Bookmark
            size={18}
            strokeWidth={1.5}
            className={`transition-transform duration-200 ease-out-strong ${
              bookmarked ? 'text-accent' : 'text-ink-900'
            } ${bookmarkPulse ? 'scale-110' : 'scale-100'}`}
            fill={bookmarked ? 'currentColor' : 'none'}
          />
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
          <div className="grid grid-cols-3 gap-3">
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
          <ListingMap listing={listing} />
        </Section>

        <Section title="Availability">
          <div className="flex items-center gap-3 bg-surface-soft rounded-2xl p-4">
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

      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-none">
          {/* Soft fade above the action bar */}
          <div className="h-6 bg-gradient-to-t from-white via-white/85 to-transparent" />
          <div className="bg-white px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] pointer-events-auto">
            {hasApplied ? (
              <div
                className="w-full bg-accent-soft text-accent-hover rounded-full h-12 font-medium flex items-center justify-center gap-2"
                role="status"
                aria-live="polite"
              >
                <Check size={18} strokeWidth={2.5} />
                Applied
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={back}
                  className="bg-white border border-border text-ink-900 rounded-full h-12 px-5 font-medium active:scale-[0.98] transition"
                >
                  Pass
                </button>
                <button
                  type="button"
                  onClick={apply}
                  disabled={applying}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-full h-12 font-medium active:scale-[0.98] transition disabled:opacity-60"
                >
                  {applying ? 'Applying…' : 'Apply'}
                </button>
              </div>
            )}
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
    <div className="rounded-2xl border border-border p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-400 font-medium mb-1">
        {label}
      </p>
      <p className="text-[15px] font-semibold text-ink-900 leading-tight tabular-nums">
        {value}
        {sub && <span className="text-ink-400 font-normal text-[12px]"> {sub}</span>}
      </p>
    </div>
  );
}
