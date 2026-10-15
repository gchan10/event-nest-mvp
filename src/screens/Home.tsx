import { Archive, Check, ChevronRight, ListChecks, Plus, Search, Settings } from 'lucide-react';
import { CategoryIcon, SectionTitle, cx } from '../components/ui';
import { ageLabel, comingUp, essentialsProgress, missingNow } from '../lib/derive';
import { useNav } from '../nav';
import { useData, useStore } from '../store';
import { CatalogItem, ChecklistDecision } from '../types';

const DECISION_NOTE: Partial<Record<ChecklistDecision, string>> = {
  registry: 'On registry', borrow: 'Can borrow', need: 'Need',
};

function NeedRow({ c, d }: { c: CatalogItem; d?: ChecklistDecision }) {
  const { setDecision } = useStore();
  const covered = d === 'have';
  return (
    <li className="flex items-center gap-3 rounded-3xl bg-white p-3 pl-4 ring-1 ring-sand-200">
      <CategoryIcon category={c.category} size={18} />
      <div className="min-w-0 flex-1">
        <p className={cx('font-semibold leading-snug', covered && 'text-ink-soft')}>{c.name}</p>
        <p className="text-xs text-ink-faint">
          {covered ? 'Covered — no need to buy' : [c.priority === 'essential' ? 'Essential' : 'Useful', d && DECISION_NOTE[d]].filter(Boolean).join(' · ')}
        </p>
      </div>
      {covered ? (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-sage-700"><Check size={20} /></span>
      ) : (
        <button onClick={() => setDecision(c.id, 'have')}
          className="min-h-[44px] shrink-0 rounded-2xl bg-sage-100 px-3 text-sm font-semibold text-sage-800 active:bg-sage-200">
          Have it
        </button>
      )}
    </li>
  );
}

export default function Home() {
  const data = useData();
  const nav = useNav();
  const { covered, total } = essentialsProgress(data);
  const missing = missingNow(data).slice(0, 5);
  const upcoming = comingUp(data);
  const name = data.profile.name.trim();
  const age = ageLabel(data.profile);

  return (
    <div className="px-4 pt-4">
      <header className="flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-sage-700">NestKit</span>
        <button aria-label="Settings" onClick={() => nav.open({ kind: 'settings' })}
          className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-ink-soft active:bg-sand-200">
          <Settings size={22} />
        </button>
      </header>

      <section className="mt-2 rounded-3xl bg-sage-600 p-5 text-white">
        <p className="text-3xl font-bold">{name || (data.profile.dateType === 'due' ? 'Your little one' : 'Your baby')}</p>
        {age && <p className="mt-0.5 text-lg text-sage-100">{age}</p>}
        <button onClick={() => nav.go('checklist')} className="mt-5 block w-full rounded-2xl bg-white/15 p-4 text-left active:bg-white/25">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{covered} of {total} essentials covered</span>
            <ChevronRight size={20} />
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${total ? (covered / total) * 100 : 0}%` }} />
          </div>
        </button>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Add Item', icon: Plus, on: () => nav.open({ kind: 'item' }) },
          { label: 'Put Away', icon: Archive, on: () => nav.go('putaway') },
          { label: 'Find Something', icon: Search, on: () => nav.go('find') },
        ].map(({ label, icon: Icon, on }) => (
          <button key={label} onClick={on}
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-3xl bg-white px-2 text-center text-sm font-semibold ring-1 ring-sand-200 active:bg-sand-100">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-100 text-sage-700"><Icon size={20} /></span>
            {label}
          </button>
        ))}
      </div>

      <button onClick={() => nav.go('checklist')}
        className="mt-3 flex min-h-[56px] w-full items-center gap-3 rounded-3xl bg-white px-4 text-left ring-1 ring-sand-200 active:bg-sand-100">
        <ListChecks size={22} className="text-sage-700" />
        <span className="flex-1 font-semibold">What do I need?</span>
        <ChevronRight size={20} className="text-ink-faint" />
      </button>

      <SectionTitle>Still missing for now</SectionTitle>
      {missing.length === 0 ? (
        <p className="rounded-3xl bg-white p-4 text-ink-soft ring-1 ring-sand-200">You're covered for this stage. Nice work.</p>
      ) : (
        <ul className="space-y-2">{missing.map((m) => <NeedRow key={m.c.id} {...m} />)}</ul>
      )}

      <SectionTitle>Coming up</SectionTitle>
      {upcoming.length === 0 ? (
        <p className="rounded-3xl bg-white p-4 text-ink-soft ring-1 ring-sand-200">
          Nothing new on the horizon. Check the full list anytime.
        </p>
      ) : (
        upcoming.map((g) => (
          <div key={g.label} className="mb-4">
            <p className="mb-2 text-sm font-semibold text-ink-soft">{g.label} <span className="font-normal text-ink-faint">· approx.</span></p>
            <ul className="space-y-2">{g.entries.map((e) => <NeedRow key={e.c.id} {...e} />)}</ul>
          </div>
        ))
      )}
    </div>
  );
}
