'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, MapPin, X } from 'lucide-react';
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

  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  const exitingRef = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!isTop || !programmaticDir || exitingRef.current) return;
    exitingRef.current = programmaticDir;
    setExiting(programmaticDir);
    setX(programmaticDir === 'right' ? 600 : -600);
    const t = setTimeout(() => onSwipeRef.current(programmaticDir), 360);
    return () => clearTimeout(t);
  }, [programmaticDir, isTop]);

  const beginExit = (dir: 'left' | 'right') => {
    exitingRef.current = dir;
    setExiting(dir);
    setX(dir === 'right' ? 600 : -600);
    setTimeout(() => onSwipeRef.current(dir), 360);
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
      if (Math.abs(offset) < 5 && performance.now() - d.startTime < 250) {
        onTap();
      }
      setX(0);
    }
  };

  const reducedMotion = useReducedMotion();

  const rotate = clamp(x / 25, -8, 8);
  const cardOpacity =
    Math.abs(x) > 100 ? Math.max(0.4, 1 - (Math.abs(x) - 100) / 200) : 1;
  const likeProgress = clamp((x - 30) / 110, 0, 1);
  const passProgress = clamp((-x - 30) / 110, 0, 1);

  const stackOffsetY = stackIndex * 12;
  const stackScale = 1 - stackIndex * 0.05;
  const stackOpacity = isTop ? 1 : Math.max(0, 1 - stackIndex * 0.25);

  const transition = reducedMotion
    ? dragRef.current
      ? 'none'
      : 'opacity 150ms ease-out'
    : exiting
      ? 'transform 360ms cubic-bezier(0.23,1,0.32,1), opacity 360ms ease-out'
      : dragRef.current
        ? 'none'
        : 'transform 280ms cubic-bezier(0.23,1,0.32,1), opacity 220ms ease-out';

  const baseOpacity = entered ? (exiting ? 0 : isTop ? cardOpacity : stackOpacity) : 0;

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
      <div className="w-full h-full bg-white rounded-3xl border border-border overflow-hidden flex flex-col shadow-soft">
        <div className="relative flex-1 bg-surface-soft overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photos[0]}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Bottom photo gradient — strong enough for white text */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

          {isTop && (
            <>
              {/* Like / Pass washes — calm tinted overlays, no rotated stamps */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none bg-warm mix-blend-multiply"
                style={{ opacity: likeProgress * 0.35 }}
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none bg-ink-900 mix-blend-multiply"
                style={{ opacity: passProgress * 0.45 }}
              />

              {/* Confirmation chips — single object, not a stamp */}
              <div
                className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  opacity: Math.max(likeProgress, passProgress),
                  transform: `translate(-50%, ${(1 - Math.max(likeProgress, passProgress)) * -8}px)`,
                  transition: dragRef.current ? 'none' : 'opacity 200ms ease-out, transform 200ms ease-out',
                }}
              >
                {likeProgress > passProgress ? (
                  <span className="inline-flex items-center gap-1.5 bg-warm text-white text-[13px] font-semibold tracking-wide uppercase px-3 h-8 rounded-full shadow-warm">
                    <Heart size={14} strokeWidth={2.5} fill="currentColor" />
                    Liked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-ink-900 text-white text-[13px] font-semibold tracking-wide uppercase px-3 h-8 rounded-full">
                    <X size={14} strokeWidth={2.5} />
                    Pass
                  </span>
                )}
              </div>
            </>
          )}

          <div className="absolute top-4 right-4 bg-black/45 text-white text-[11px] font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none tabular-nums">
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
