'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Inbox,
  PartyPopper,
  Sparkles,
  X,
} from 'lucide-react';
import { Pill } from './Pill';
import { fmtCHF, timeSince } from '@/lib/format';
import { useAppStore } from '@/lib/store';
import { getApplications } from '@/lib/api/applications-client';
import { getListings } from '@/lib/api/listings-client';
import { updateApplicationStatus } from '@/lib/api/applications-client';
import type { Application, ApplicationStatus, Listing } from '@/lib/types';
import { StatusSkeleton } from './StatusSkeleton';

export function StatusView() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);

  const [applications, setApplications] = useState<Application[]>([]);
  const [listingsMap, setListingsMap] = useState<Map<string, Listing>>(new Map());
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getApplications(), getListings()])
      .then(([apps, lsts]) => {
        setApplications(apps);
        setListingsMap(new Map(lsts.map((l) => [l.id, l])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reviewing = applications.find((a) => a.id === reviewingId);
  const reviewingListing = reviewing ? listingsMap.get(reviewing.listingId) : undefined;

  const byListing = (id: string) => listingsMap.get(id);

  const approve = async (id: string) => {
    await updateApplicationStatus(id, 'applied');
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'applied' as ApplicationStatus, updatedAt: Date.now() }
          : a,
      ),
    );
    showToast('Sent. The owner will be in touch.', 2200);
  };

  const discard = async (id: string) => {
    await updateApplicationStatus(id, 'rejected');
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const pending = applications.filter((a) => a.status === 'pending_review');
  const active = applications.filter((a) =>
    (['applied', 'visit_requested', 'visit_booked'] as ApplicationStatus[]).includes(
      a.status,
    ),
  );
  const decided = applications.filter((a) =>
    (['accepted', 'rejected'] as ApplicationStatus[]).includes(a.status),
  );

  const openListing = (id: string) => router.push(`/listing/${id}`);

  return (
    <div className="min-h-[100dvh] bg-white pb-32">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-20">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink-900">
          Status
        </h1>
        <span className="text-[13px] text-ink-600 tabular-nums">
          {applications.length} application{applications.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="px-5 pt-5 space-y-8">
        {loading ? (
          <StatusSkeleton />
        ) : (
          <>
            {pending.length > 0 && (
              <StatusGroup title="Awaiting your review" count={pending.length}>
                {pending.map((a) => {
                  const l = byListing(a.listingId);
                  if (!l) return null;
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setReviewingId(a.id)}
                      className="w-full text-left rounded-2xl bg-warm-soft p-3 flex gap-3 active:scale-[0.99] transition-transform relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-warm" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.photos[0]}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        alt=""
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-[12px] font-medium text-ink-600">
                            {l.neighborhood} · {fmtCHF(l.price)}/mo
                          </p>
                          <p className="text-[15px] font-semibold text-ink-900 truncate">
                            {l.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-warm-ink">
                          <Sparkles size={14} strokeWidth={1.8} />
                          Review application
                          <ArrowRight size={14} strokeWidth={1.8} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </StatusGroup>
            )}

            {active.length > 0 && (
              <StatusGroup title="Active applications" count={active.length}>
                {active.map((a) => {
                  const l = byListing(a.listingId);
                  if (!l) return null;
                  return (
                    <ApplicationRow
                      key={a.id}
                      app={a}
                      listing={l}
                      onClick={() => openListing(l.id)}
                    />
                  );
                })}
              </StatusGroup>
            )}

            {decided.length > 0 && (
              <StatusGroup title="Decided" count={decided.length}>
                {decided.map((a) => {
                  const l = byListing(a.listingId);
                  if (!l) return null;
                  return (
                    <ApplicationRow
                      key={a.id}
                      app={a}
                      listing={l}
                      onClick={() => openListing(l.id)}
                    />
                  );
                })}
              </StatusGroup>
            )}

            {applications.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center mx-auto mb-4 text-ink-400">
                  <Inbox size={24} strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-semibold text-ink-900 mb-1">
                  No applications yet
                </p>
                <p className="text-[14px] text-ink-600 max-w-xs mx-auto">
                  Swipe right on a flat to start your first application.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ReviewModal
        application={reviewing ?? null}
        listing={reviewingListing ?? null}
        onClose={() => setReviewingId(null)}
        onApprove={() => {
          if (!reviewing) return;
          void approve(reviewing.id);
          setReviewingId(null);
        }}
        onDiscard={() => {
          if (!reviewing) return;
          void discard(reviewing.id);
          setReviewingId(null);
        }}
      />
    </div>
  );
}

function StatusGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-400">
          {title}
        </h2>
        <span className="text-[12px] text-ink-400">·</span>
        <span className="text-[12px] text-ink-400 font-medium tabular-nums">{count}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function statusPill(status: ApplicationStatus): {
  label: string;
  tone: 'accent' | 'warm' | 'success' | 'neutral';
} {
  switch (status) {
    case 'applied':
      return { label: 'Applied', tone: 'accent' };
    case 'visit_requested':
      return { label: 'Visit requested', tone: 'warm' };
    case 'visit_booked':
      return { label: 'Visit booked', tone: 'success' };
    case 'accepted':
      return { label: 'Accepted', tone: 'warm' };
    case 'rejected':
      return { label: 'Not selected', tone: 'neutral' };
    default:
      return { label: status, tone: 'neutral' };
  }
}

function ApplicationRow({
  app,
  listing,
  onClick,
}: {
  app: Application;
  listing: Listing;
  onClick: () => void;
}) {
  const pill = statusPill(app.status);
  const isAccepted = app.status === 'accepted';
  const isRejected = app.status === 'rejected';
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-white p-3 flex gap-3 active:scale-[0.99] transition-transform relative overflow-hidden"
    >
      {isAccepted && <div className="absolute left-0 top-0 bottom-0 w-1 bg-warm" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={listing.photos[0]}
        className={`w-20 h-20 rounded-xl object-cover flex-shrink-0 transition ${
          isRejected ? 'grayscale' : ''
        }`}
        alt=""
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-[12px] font-medium text-ink-600">
            {listing.neighborhood} · {fmtCHF(listing.price)}/mo
          </p>
          <p
            className={`text-[15px] font-semibold truncate leading-tight ${
              isRejected ? 'text-ink-600' : 'text-ink-900'
            }`}
          >
            {listing.title}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Pill tone={pill.tone}>
            {app.status === 'accepted' && (
              <PartyPopper size={12} strokeWidth={2} />
            )}
            {app.status === 'visit_booked' && <Calendar size={12} strokeWidth={2} />}
            {pill.label}
          </Pill>
          <span className="text-[11px] text-ink-400 font-medium tabular-nums">
            {timeSince(app.updatedAt)}
          </span>
        </div>
        {app.visitDate && app.status === 'visit_booked' && (
          <p className="text-[12px] text-success-ink font-medium mt-0.5">
            {app.visitDate}
          </p>
        )}
      </div>
    </button>
  );
}

type ModalPhase = 'enter' | 'enter-active' | 'exit' | 'exit-active' | null;

function ReviewModal({
  application,
  listing,
  onClose,
  onApprove,
  onDiscard,
}: {
  application: Application | null;
  listing: Listing | null;
  onClose: () => void;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  const [visible, setVisible] = useState<{
    application: Application;
    listing: Listing;
  } | null>(null);
  const [phase, setPhase] = useState<ModalPhase>(null);

  useEffect(() => {
    if (application && listing) {
      setVisible({ application, listing });
      setPhase('enter');
      const r = requestAnimationFrame(() => setPhase('enter-active'));
      return () => cancelAnimationFrame(r);
    }
    if (visible) {
      setPhase('exit');
      const r = requestAnimationFrame(() => setPhase('exit-active'));
      const t = setTimeout(() => {
        setVisible(null);
        setPhase(null);
      }, 240);
      return () => {
        cancelAnimationFrame(r);
        clearTimeout(t);
      };
    }
  }, [application, listing, visible]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;

  const backdropClass =
    phase === 'enter'
      ? 'backdrop-enter'
      : phase === 'enter-active'
        ? 'backdrop-enter backdrop-enter-active'
        : phase === 'exit'
          ? 'backdrop-exit'
          : phase === 'exit-active'
            ? 'backdrop-exit backdrop-exit-active'
            : '';

  const sheetClass =
    phase === 'enter'
      ? 'sheet-enter'
      : phase === 'enter-active'
        ? 'sheet-enter sheet-enter-active'
        : phase === 'exit'
          ? 'sheet-exit'
          : phase === 'exit-active'
            ? 'sheet-exit sheet-exit-active'
            : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Review application"
    >
      <div
        className={`absolute inset-0 bg-ink-900/40 ${backdropClass}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md bg-white rounded-t-3xl max-h-[92dvh] flex flex-col shadow-sheet ${sheetClass}`}
      >
        <div className="px-5 pt-3 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-3 pb-4 flex items-start justify-between border-b border-border">
          <div className="min-w-0 pr-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-warm-ink">
              Cover letter draft
            </p>
            <p className="text-[16px] font-semibold text-ink-900 truncate mt-0.5">
              {visible.listing.neighborhood} · {visible.listing.street}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-soft hover:bg-border flex items-center justify-center text-ink-600 flex-shrink-0 active:scale-95 transition"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="rounded-2xl bg-surface-soft p-4 mb-4 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visible.listing.photos[0]}
              className="w-14 h-14 rounded-lg object-cover"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink-900 truncate">
                {visible.listing.title}
              </p>
              <p className="text-[12px] text-ink-600">
                {visible.listing.rooms} rooms · {visible.listing.sqm} m² ·{' '}
                {fmtCHF(visible.listing.price)}/mo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center">
              <Sparkles size={12} className="text-accent-hover" strokeWidth={2} />
            </span>
            <p className="text-[13px] font-medium text-ink-600">
              Drafted with your profile · German
            </p>
          </div>

          <div className="text-[14px] text-ink-900 leading-[1.65] whitespace-pre-line">
            {visible.application.coverLetter}
          </div>
        </div>

        <div className="border-t border-border px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] bg-white">
          <button
            type="button"
            onClick={onApprove}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-full h-12 font-medium active:scale-[0.98] transition mb-2"
          >
            Approve &amp; send
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="w-full text-ink-600 text-[14px] font-medium h-10 hover:text-error transition-colors active:scale-[0.99]"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
