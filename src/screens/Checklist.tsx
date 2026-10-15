import { Check, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { CategoryIcon, Chip, cx } from '../components/ui';
import { AGE_WINDOWS, CATALOG } from '../data/catalog';
import { ageMonths, decisionFor } from '../lib/derive';
import { DECISIONS, PRIORITY_LABEL, PRIORITY_TONE } from '../lib/meta';
import { useNav } from '../nav';
import { useData, useStore } from '../store';
import { ChecklistDecision } from '../types';

type Filter = 'all' | 'todo' | 'missing' | 'covered';

const DECISION_ACTIVE: Record<ChecklistDecision, string> = {
  have: 'bg-sage-600 text-white ring-sage-600',
  registry: 'bg-sky-600 text-white ring-sky-600',
  borrow: 'bg-violet-600 text-white ring-violet-600',
  need: 'bg-amber-500 text-white ring-amber-500',
  skip: 'bg-ink-faint text-white ring-ink-faint',
};

export default function Checklist() {
  const data = useData();
  const { setDecision } = useStore();
  const nav = useNav();
  const [filter, setFilter] = useState<Filter>('all');

  const rows = CATALOG.map((c) => ({ c, d: decisionFor(c.id, data.items) }));
  const covered = rows.filter((r) => r.d === 'have').length;
  const decided = rows.filter((r) => r.d).length;
  const visible = rows.filter((r) =>
    filter === 'all' ? true
      : filter === 'todo' ? !r.d
        : filter === 'covered' ? r.d === 'have'
          : r.d !== 'have' && r.d !== 'skip');
  const age = ageMonths(data.profile);

  return (
    <div className="px-4">
      <header className="sticky top-0 z-10 -mx-4 bg-cream/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center gap-1">
          <button onClick={() => nav.go('home')} aria-label="Back" className="-ml-2 grid h-11 w-11 place-items-center rounded-full active:bg-sand-200">
            <ChevronLeft size={26} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">What do I need?</h1>
            <p className="text-sm text-ink-soft">{covered} covered · {CATALOG.length - decided} to decide</p>
          </div>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {([['all', 'All'], ['todo', 'To decide'], ['missing', 'Still need'], ['covered', 'Covered']] as const).map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>
          ))}
        </div>
      </header>

      <p className="mb-2 mt-1 rounded-2xl bg-white px-4 py-3 text-sm text-ink-soft ring-1 ring-sand-200">
        A starting point, not a shopping list. Tap <b>Have it</b> for anything you already own, received or borrowed.
      </p>

      {AGE_WINDOWS.map((w, wi) => {
        const next = AGE_WINDOWS[wi + 1]?.start ?? 99;
        const group = visible.filter((r) => r.c.startMonth >= w.start && r.c.startMonth < next);
        if (!group.length) return null;
        const isNow = age !== null && age >= w.start && age < next;
        return (
          <section key={w.label}>
            <h2 className="mb-2 mt-6 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
              {w.label}
              {isNow && <span className="rounded-full bg-sage-100 px-2 py-0.5 normal-case tracking-normal text-sage-700">Now</span>}
            </h2>
            <ul className="space-y-3">
              {group.map(({ c, d }) => {
                const linked = data.items.filter((i) => i.catalogId === c.id);
                return (
                  <li key={c.id} className={cx('rounded-3xl bg-white p-4 ring-1 ring-sand-200', d === 'skip' && 'opacity-60')}>
                    <div className="flex gap-3">
                      <CategoryIcon category={c.category} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[17px] font-semibold leading-snug">{c.name}</span>
                          {d === 'have' && <Check size={18} className="text-sage-600" aria-label="Covered" />}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className={cx('rounded-full px-2 py-0.5 font-semibold', PRIORITY_TONE[c.priority])}>{PRIORITY_LABEL[c.priority]}</span>
                          <span className="text-ink-faint">{c.ageLabel}</span>
                          {linked.length > 0 && (
                            <button className="font-semibold text-sage-700 underline-offset-2 active:underline"
                              onClick={() => nav.open({ kind: 'item', id: linked[0].id })}>
                              {linked.length > 1 ? `${linked.length} in My Stuff` : 'Details'}
                            </button>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm leading-snug text-ink-soft">{c.why}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {DECISIONS.map((x) => (
                        <button
                          key={x.id}
                          onClick={() => setDecision(c.id, x.id)}
                          aria-pressed={d === x.id}
                          className={cx(
                            'min-h-[44px] rounded-xl px-1 text-[13px] font-semibold leading-tight ring-1 transition-colors',
                            d === x.id ? DECISION_ACTIVE[x.id] : 'bg-cream text-ink-soft ring-sand-200 active:bg-sand-100',
                          )}
                        >
                          {x.label}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {!visible.length && <p className="py-10 text-center text-ink-soft">Nothing here yet.</p>}
    </div>
  );
}
