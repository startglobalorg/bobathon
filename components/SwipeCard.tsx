'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Pill } from './Pill';
import { fmtCHF } from '@/lib/format';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { Listing } from '@/lib/types';

type Props = {
  listing: Listing;
  isTop: boolean;
  stackIndex: number;
  programmaticDir: 'left' | 'right' | null;
  onSwipe: (dir: 'left' | 'right') => void;
  onTap: () => void;
};

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 0.6; // px/ms

export function SwipeCard({
  listing,
  isTop,
  stackIndex,
  programmaticDir,
  onSwipe,
  onTap,
}: Props) {
  const [x, setX] = useState(0);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const [entered, setEntered] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startTime: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    pointerId: number;
  } | null>(null);

  // Mount-in animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Programmatic swipe (button click on top card)
  useEffect(() => {
    if (!isTop || !programmaticDir || exiting) return;
    setExiting(programmaticDir);
    setX(programmaticDir === 'right' ? 600 : -600);
    const t = setTimeout(() => onSwipe(programmaticDir), 360);
    return () => clearTimeout(t);
  }, [programmaticDir, isTop, exiting, onSwipe]);

  const beginExit = (dir: 'left' | 'right') => {
    setExiting(dir);
    setX(dir === 'right' ? 600 : -600);
    setTimeout(() => onSwipe(dir), 360);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop || exiting) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startTime: performance.now(),
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
      pointerId: e.pointerId,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastTime);
    d.velocity = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastTime = now;
    setX(e.clientX - d.startX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    const offset = e.clientX - d.startX;
    const v = d.velocity;
    if (offset > SWIPE_THRESHOLD || v > VELOCITY_THRESHOLD) {
      beginExit('right');
    } else if (offset < -SWIPE_THRESHOLD || v < -VELOCITY_THRESHOLD) {
      beginExit('left');
    } else {
      // small drag = treat as tap
      if (Math.abs(offset) < 5 && performance.now() - d.startTime < 250) {
        onTap();
      }
      setX(0);
    }
  };

  const reducedMotion = useReducedMotion();

  // Visual transforms
  const rotate = clamp(x / 25, -8, 8);
  const cardOpacity =
    Math.abs(x) > 100 ? Math.max(0.4, 1 - (Math.abs(x) - 100) / 200) : 1;
  const likeOpacity = clamp((x - 40) / 100, 0, 1);
  const passOpacity = clamp((-x - 40) / 100, 0, 1);

  const stackOffsetY = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.04;

  // Mount/exit transitions
  const transition = reducedMotion
    ? dragRef.current
      ? 'none'
      : 'opacity 150ms ease-out'
    : exiting
      ? 'transform 360ms cubic-bezier(0.2,0.8,0.2,1), opacity 360ms ease-out'
      : dragRef.current
        ? 'none'
        : 'transform 280ms cubic-bezier(0.2,0.8,0.2,1), opacity 220ms ease-out';

  const baseOpacity = entered ? (exiting ? 0 : isTop ? cardOpacity : 1) : 0;

  const transform = reducedMotion
    ? exiting
      ? `translate3d(0, ${stackOffsetY}px, 0) scale(${stackScale})`
      : `translate3d(${isTop ? x : 0}px, ${entered ? stackOffsetY : stackOffsetY + 16}px, 0) scale(${entered ? stackScale : stackScale - 0.04})`
    : exiting
      ? `translate3d(${x}px, ${stackOffsetY}px, 0) rotate(${exiting === 'right' ? 12 : -12}deg) scale(${stackScale})`
      : `translate3d(${isTop ? x : 0}px, ${entered ? stackOffsetY : stackOffsetY + 16}px, 0) rotate(${isTop ? rotate : 0}deg) scale(${entered ? stackScale : stackScale - 0.04})`;

  return (
    <div
      className="absolute inset-0 select-none touch-none"
      style={{
        zIndex: 10 - stackIndex,
        transform,
        opacity: baseOpacity,
        transition,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="w-full h-full bg-white rounded-3xl border border-border overflow-hidden flex flex-col">
        <div className="relative flex-1 bg-surface-soft overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photos[0]}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {isTop && (
            <>
              <div
                className="absolute top-6 left-6 pointer-events-none"
                style={{ opacity: likeOpacity }}
              >
                <div className="border-[3px] border-warm rounded-xl px-3 py-1.5 -rotate-12 bg-white/10 backdrop-blur-sm">
                  <span className="text-warm text-2xl font-extrabold tracking-wider">
                    LIKED
                  </span>
                </div>
              </div>
              <div
                className="absolute top-6 right-6 pointer-events-none"
                style={{ opacity: passOpacity }}
              >
                <div className="border-[3px] border-ink-900 rounded-xl px-3 py-1.5 rotate-12 bg-white/10 backdrop-blur-sm">
                  <span className="text-ink-900 text-2xl font-extrabold tracking-wider">
                    PASS
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="absolute top-4 right-4 bg-black/40 text-white text-[11px] font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            1 / {listing.photos.length}
          </div>
        </div>

        <div className="p-5 pb-6">
          <div className="flex items-center gap-1.5 text-ink-600 text-[13px] mb-1">
            <MapPin size={14} className="text-ink-400" strokeWidth={1.5} />
            <span className="font-medium">{listing.neighborhood}</span>
            <span className="text-ink-400">·</span>
            <span>{listing.street}</span>
          </div>
          <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink-900 leading-tight mb-3">
            {listing.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="neutral">{listing.rooms} rooms</Pill>
            <Pill tone="neutral">{listing.sqm} m²</Pill>
            <Pill tone="accent">{fmtCHF(listing.price)}/mo</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
