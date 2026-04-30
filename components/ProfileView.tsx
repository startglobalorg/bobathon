'use client';

import { useMemo, type ReactNode } from 'react';
import {
  ChevronDown,
  FileCheck2,
  FileText,
  Home,
  MessageCircle,
  Plus,
  Settings2,
  Upload,
  User,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fmtCHF } from '@/lib/format';
import { useAppStore } from '@/lib/store';
import { NATIONALITIES, NEIGHBORHOODS } from '@/lib/data';
import type { DocStatus, Profile } from '@/lib/types';

export function ProfileView() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const updatePref = <K extends keyof Profile['preferences']>(
    key: K,
    value: Profile['preferences'][K],
  ) =>
    setProfile((p) => ({
      ...p,
      preferences: { ...p.preferences, [key]: value },
    }));

  const completeness = useMemo(() => {
    const checks = [
      profile.firstName,
      profile.lastName,
      profile.birthday,
      profile.nationality,
      profile.email,
      profile.phone,
      profile.bio,
      profile.documents.cv.uploaded,
      profile.documents.debt.uploaded,
      profile.documents.salary.uploaded,
      profile.landlords.length > 0,
      profile.preferences.neighborhoods.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [profile]);

  return (
    <div className="min-h-[100dvh] bg-white pb-32">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between bg-white border-b border-border sticky top-0 z-20">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink-900">
          Profile
        </h1>
        <button type="button" className="text-accent text-[14px] font-medium">
          Saved
        </button>
      </header>

      <div className="px-5 pt-5">
        <div className="rounded-2xl border border-border p-4">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[14px] font-semibold text-ink-900">
              Profile completeness
            </p>
            <p className="text-[14px] font-semibold text-accent-hover">
              {completeness}%
            </p>
          </div>
          <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <p className="text-[13px] text-ink-600 mt-2.5 leading-relaxed">
              Almost there. A few more details and your applications stand out.
            </p>
          )}
        </div>
      </div>

      <ProfileSection title="Personal info" icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            value={profile.firstName}
            onChange={(v) => update('firstName', v)}
          />
          <Field
            label="Last name"
            value={profile.lastName}
            onChange={(v) => update('lastName', v)}
          />
          <Field
            label="Birthday"
            type="date"
            value={profile.birthday}
            onChange={(v) => update('birthday', v)}
          />
          <SelectField
            label="Nationality"
            value={profile.nationality}
            options={NATIONALITIES}
            onChange={(v) => update('nationality', v)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-3">
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={(v) => update('email', v)}
          />
          <Field
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={(v) => update('phone', v)}
          />
        </div>
      </ProfileSection>

      <ProfileSection title="About you" icon={MessageCircle}>
        <label className="block">
          <span className="text-[13px] font-medium text-ink-600 mb-1.5 block">
            Short bio
          </span>
          <textarea
            value={profile.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="A few sentences about you — what you do, what you're like to live with."
            rows={4}
            className="w-full rounded-xl border border-border bg-white p-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none resize-none"
          />
        </label>
      </ProfileSection>

      <ProfileSection title="Documents" icon={FileText}>
        <div className="space-y-2.5">
          <DocTile
            label="CV"
            doc={profile.documents.cv}
            onUpload={() =>
              update('documents', {
                ...profile.documents,
                cv: { name: 'Lea_Marti_CV_2026.pdf', uploaded: true },
              })
            }
            onClear={() =>
              update('documents', {
                ...profile.documents,
                cv: { name: null, uploaded: false },
              })
            }
          />
          <DocTile
            label="Debt collection certificate"
            sub="Betreibungsauszug"
            doc={profile.documents.debt}
            onUpload={() =>
              update('documents', {
                ...profile.documents,
                debt: { name: 'Betreibungsauszug_April2026.pdf', uploaded: true },
              })
            }
            onClear={() =>
              update('documents', {
                ...profile.documents,
                debt: { name: null, uploaded: false },
              })
            }
          />
          <DocTile
            label="Proof of salary or education"
            doc={profile.documents.salary}
            onUpload={() =>
              update('documents', {
                ...profile.documents,
                salary: { name: 'Lohnabrechnung_Q1_2026.pdf', uploaded: true },
              })
            }
            onClear={() =>
              update('documents', {
                ...profile.documents,
                salary: { name: null, uploaded: false },
              })
            }
          />
        </div>
      </ProfileSection>

      <ProfileSection title="Previous landlords" icon={Home}>
        <div className="space-y-3">
          {profile.landlords.map((l, i) => (
            <div key={i} className="rounded-xl border border-border p-3.5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                  Landlord {i + 1}
                </span>
                {profile.landlords.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'landlords',
                        profile.landlords.filter((_, j) => j !== i),
                      )
                    }
                    className="text-ink-400 hover:text-error"
                    aria-label="Remove"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                <Field
                  label="Name"
                  value={l.name}
                  onChange={(v) => {
                    const next = [...profile.landlords];
                    next[i] = { ...l, name: v };
                    update('landlords', next);
                  }}
                  compact
                />
                <Field
                  label="Contact"
                  value={l.contact}
                  onChange={(v) => {
                    const next = [...profile.landlords];
                    next[i] = { ...l, contact: v };
                    update('landlords', next);
                  }}
                  compact
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="From"
                    value={l.from}
                    onChange={(v) => {
                      const next = [...profile.landlords];
                      next[i] = { ...l, from: v };
                      update('landlords', next);
                    }}
                    compact
                    placeholder="2022-03"
                  />
                  <Field
                    label="To"
                    value={l.to}
                    onChange={(v) => {
                      const next = [...profile.landlords];
                      next[i] = { ...l, to: v };
                      update('landlords', next);
                    }}
                    compact
                    placeholder="present"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update('landlords', [
                ...profile.landlords,
                { name: '', contact: '', from: '', to: '' },
              ])
            }
            className="w-full h-12 rounded-xl border border-dashed border-border text-ink-600 font-medium text-[14px] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Add another
          </button>
        </div>
      </ProfileSection>

      <ProfileSection title="Preferences" icon={Settings2}>
        <div className="space-y-5">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-medium text-ink-600">Max rent</span>
              <span className="text-[15px] font-semibold text-ink-900">
                {fmtCHF(profile.preferences.maxRent)}
              </span>
            </div>
            <input
              type="range"
              min={1500}
              max={5000}
              step={50}
              value={profile.preferences.maxRent}
              onChange={(e) => updatePref('maxRent', Number(e.target.value))}
              className="w-full apartner-slider"
            />
            <div className="flex justify-between text-[11px] text-ink-400 mt-1">
              <span>CHF 1&apos;500</span>
              <span>CHF 5&apos;000</span>
            </div>
          </div>

          <div>
            <span className="text-[13px] font-medium text-ink-600 mb-2 block">
              Min rooms
            </span>
            <div className="flex flex-wrap gap-2">
              {[1, 1.5, 2, 2.5, 3, '3.5+'].map((r) => {
                const v = r === '3.5+' ? 3.5 : (r as number);
                const active = profile.preferences.minRooms === v;
                return (
                  <button
                    type="button"
                    key={String(r)}
                    onClick={() => updatePref('minRooms', v)}
                    className={`h-10 px-4 rounded-full text-[14px] font-medium transition ${
                      active
                        ? 'bg-accent text-white'
                        : 'bg-white border border-border text-ink-900 hover:border-accent'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-medium text-ink-600">Min size</span>
              <span className="text-[15px] font-semibold text-ink-900">
                {profile.preferences.minSqm} m²
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              step={5}
              value={profile.preferences.minSqm}
              onChange={(e) => updatePref('minSqm', Number(e.target.value))}
              className="w-full apartner-slider"
            />
            <div className="flex justify-between text-[11px] text-ink-400 mt-1">
              <span>20 m²</span>
              <span>150 m²</span>
            </div>
          </div>

          <div>
            <span className="text-[13px] font-medium text-ink-600 mb-2 block">
              Neighborhoods
            </span>
            <div className="flex flex-wrap gap-1.5">
              {NEIGHBORHOODS.map((n) => {
                const active = profile.preferences.neighborhoods.includes(n);
                return (
                  <button
                    type="button"
                    key={n}
                    onClick={() => {
                      const cur = profile.preferences.neighborhoods;
                      updatePref(
                        'neighborhoods',
                        active ? cur.filter((x) => x !== n) : [...cur, n],
                      );
                    }}
                    className={`h-8 px-3 rounded-full text-[12px] font-medium transition ${
                      active
                        ? 'bg-accent-soft text-accent-hover border border-accent/30'
                        : 'bg-white border border-border text-ink-600'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Toggle
              label="Balcony"
              value={profile.preferences.balcony}
              onChange={(v) => updatePref('balcony', v)}
            />
            <Toggle
              label="Parking"
              value={profile.preferences.parking}
              onChange={(v) => updatePref('parking', v)}
            />
            <Toggle
              label="Pet-friendly"
              value={profile.preferences.petFriendly}
              onChange={(v) => updatePref('petFriendly', v)}
            />
          </div>

          <div>
            <span className="text-[13px] font-medium text-ink-600 mb-2 block">
              Furnished
            </span>
            <div className="flex bg-surface-soft rounded-full p-1 h-11">
              {(['Any', 'Furnished', 'Unfurnished'] as const).map((o) => {
                const active = profile.preferences.furnished === o;
                return (
                  <button
                    type="button"
                    key={o}
                    onClick={() => updatePref('furnished', o)}
                    className={`flex-1 rounded-full text-[13px] font-medium transition ${
                      active
                        ? 'bg-white text-ink-900 shadow-soft'
                        : 'text-ink-600'
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ProfileSection>
    </div>
  );
}

function ProfileSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="px-5 pt-7">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-7 h-7 rounded-lg bg-surface-soft flex items-center justify-center text-ink-600">
          <Icon size={16} strokeWidth={1.5} />
        </span>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-600 mb-1 block">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${compact ? 'h-10' : 'h-12'} rounded-xl border border-border bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-600 mb-1 block">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 rounded-xl border border-border bg-white pl-3 pr-9 text-[15px] text-ink-900 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none appearance-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          <ChevronDown size={16} strokeWidth={1.5} />
        </span>
      </div>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between h-12 px-1"
    >
      <span className="text-[15px] text-ink-900">{label}</span>
      <span
        className={`relative w-11 h-6 rounded-full transition ${value ? 'bg-accent' : 'bg-[#D5D9DD]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : ''}`}
        />
      </span>
    </button>
  );
}

function DocTile({
  label,
  sub,
  doc,
  onUpload,
  onClear,
}: {
  label: string;
  sub?: string;
  doc: DocStatus;
  onUpload: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-border p-3.5 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          doc.uploaded ? 'bg-success-soft text-success-ink' : 'bg-surface-soft text-ink-600'
        }`}
      >
        {doc.uploaded ? (
          <FileCheck2 size={18} strokeWidth={1.5} />
        ) : (
          <Upload size={18} strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink-900 truncate">{label}</p>
        {doc.uploaded ? (
          <p className="text-[12px] text-ink-600 truncate">{doc.name}</p>
        ) : (
          <p className="text-[12px] text-ink-400">{sub || 'PDF or image'}</p>
        )}
      </div>
      {doc.uploaded ? (
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] font-medium text-ink-600 hover:text-accent"
        >
          Replace
        </button>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          className="text-[13px] font-medium text-accent"
        >
          Upload
        </button>
      )}
    </div>
  );
}
