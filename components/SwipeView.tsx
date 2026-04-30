'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Coffee, Heart, X } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { SwipeCard } from './SwipeCard';
import { SwipeSkeleton } from './SwipeSkeleton';
import { useAppStore } from '@/lib/store';
import { getListings } from '@/lib/api/listings-client';
import { likeListingApi } from '@/lib/api/applications-client';
import type { Listing } from '@/lib/types';

export function SwipeView() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);

  const [listings, setListings] = useState<Listing[] | null>(null);
  const [index, setIndex] = useState(0);
  const [programmaticDir, setProgrammaticDir] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((e) => {
        console.error(e);
        setListings([]);
      });
  }, []);

  const remaining = listings ? listings.slice(index, index + 3) : [];
  const top = remaining[0];

  const advance = async (dir: 'left' | 'right') => {
    if (!top) return;
    if (dir === 'right') {
      showToast('Liked. Drafting your application…', 1800);
      setTimeout(
        () => showToast('Application drafted — review in Status', 2400),
        1900,
      );
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
    setListings(null);
    getListings()
      .then(setListings)
      .catch(() => setListings([]));
  };

  // Keyboard equivalents — CI requires keyboard parity for swipe gestures
  useEffect(() => {
    if (!top) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        buttonSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        buttonSwipe('left');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openListing(top.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top?.id]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between">
        <Wordmark />
        <div className="w-10 h-10" aria-hidden />
      </header>

      <div className="flex-1 px-5 pb-[calc(120px+env(safe-area-inset-bottom))] flex flex-col">
        {listings === null ? (
          <SwipeSkeleton />
        ) : top ? (
          <>
            <div
              className="relative w-full mt-2 mx-auto"
              style={{
                maxWidth: 380,
                aspectRatio: '4 / 5',
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

            <div className="flex items-center justify-center gap-7 mt-7">
              <button
                type="button"
                onClick={() => buttonSwipe('left')}
                className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center text-ink-900 active:scale-90 transition-transform duration-150 ease-out shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
                aria-label="Pass"
              >
                <X size={26} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => buttonSwipe('right')}
                className="w-16 h-16 rounded-full bg-warm flex items-center justify-center text-white active:scale-90 transition-transform duration-150 ease-out shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2"
                aria-label="Like"
              >
                <Heart size={26} strokeWidth={2.5} fill="currentColor" />
              </button>
            </div>

            <p className="text-center text-[13px] text-ink-400 mt-4 font-medium uppercase tracking-[0.06em] tabular-nums">
              {listings.length - index} left in your deck
            </p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-5 text-ink-600">
              <Coffee size={28} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-[30px] font-semibold tracking-[-0.02em] text-ink-900 mb-2 max-w-xs leading-tight">
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
