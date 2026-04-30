'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Coffee, Heart, Info, SlidersHorizontal, X } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { SwipeCard } from './SwipeCard';
import { useAppStore } from '@/lib/store';
import { getListings } from '@/lib/api/listings-client';
import { likeListingApi } from '@/lib/api/applications-client';
import type { Listing } from '@/lib/types';

export function SwipeView() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);

  const [listings, setListings] = useState<Listing[]>([]);
  const [index, setIndex] = useState(0);
  const [programmaticDir, setProgrammaticDir] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    getListings().then(setListings).catch(console.error);
  }, []);

  const remaining = listings.slice(index, index + 3);
  const top = remaining[0];

  const advance = async (dir: 'left' | 'right') => {
    if (!top) return;
    if (dir === 'right') {
      showToast('Liked. Drafting your application…', 1800);
      setTimeout(() => showToast('Application drafted — review in Status', 2400), 1900);
      likeListingApi(top.id).catch(console.error);
    }
    setIndex((i) => i + 1);
    setProgrammaticDir(null);
  };

  const buttonSwipe = (dir: 'left' | 'right') => {
    if (!top) return;
    setProgrammaticDir(dir);
  };

  const openListing = (id: string) => router.push(`/listing/${id}`);

  const handleReset = () => {
    setIndex(0);
    getListings().then(setListings).catch(console.error);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between">
        <Wordmark />
        <button
          type="button"
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ink-600"
          aria-label="Filters"
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
        </button>
      </header>

      <div className="flex-1 px-5 pb-[calc(120px+env(safe-area-inset-bottom))] flex flex-col">
        {top ? (
          <>
            <div
              className="relative w-full mt-2 mx-auto"
              style={{
                maxWidth: 380,
                aspectRatio: '3 / 4.6',
                maxHeight: 'calc(100dvh - 360px)',
              }}
            >
              {remaining.map((l, i) => (
                <SwipeCard
                  key={l.id}
                  listing={l}
                  isTop={i === 0}
                  stackIndex={i}
                  programmaticDir={i === 0 ? programmaticDir : null}
                  onSwipe={advance}
                  onTap={() => openListing(l.id)}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-7">
              <button
                type="button"
                onClick={() => buttonSwipe('left')}
                className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center text-ink-900 active:scale-95 transition-transform shadow-soft"
                aria-label="Pass"
              >
                <X size={26} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => openListing(top.id)}
                className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-ink-600 active:scale-95 transition-transform"
                aria-label="View details"
              >
                <Info size={20} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => buttonSwipe('right')}
                className="w-16 h-16 rounded-full bg-warm flex items-center justify-center text-white active:scale-95 transition-transform shadow-warm"
                aria-label="Like"
              >
                <Heart size={26} strokeWidth={2.5} />
              </button>
            </div>

            <p className="text-center text-[12px] text-ink-400 mt-4 font-medium">
              {listings.length - index} left in your deck
            </p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-5">
              <Coffee size={28} className="text-accent-hover" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-ink-900 mb-2 max-w-xs">
              Quiet here for now.
            </h2>
            <p className="text-ink-600 text-[15px] leading-relaxed max-w-xs mb-7">
              New flats land daily — we&apos;ll ping you the moment something fits.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="bg-accent hover:bg-accent-hover text-white rounded-full h-12 px-6 font-medium active:scale-[0.98] transition"
            >
              Reset deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
