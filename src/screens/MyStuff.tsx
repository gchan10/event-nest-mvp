import { Package, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import ItemRow from '../components/ItemRow';
import { Button, Chip, Empty, inputCls } from '../components/ui';
import { isCovered, CATEGORIES } from '../lib/meta';
import { search, terms } from '../lib/search';
import { useNav } from '../nav';
import { useData } from '../store';
import { Category, InventoryItem } from '../types';

type StatusFilter = 'all' | 'have' | 'need' | 'registry' | 'borrow' | 'skipped';
const STATUS_FILTERS: [StatusFilter, string][] = [
  ['all', 'All'], ['have', 'Have'], ['need', 'Need'], ['registry', 'Registry'], ['borrow', 'Can borrow'], ['skipped', 'Skipped'],
];

const matchStatus = (f: StatusFilter, i: InventoryItem) =>
  f === 'all' ? i.status !== 'skipped'
    : f === 'have' ? isCovered(i.status)
      : f === 'need' ? i.status === 'need'
        : f === 'registry' ? i.status === 'registry'
          : f === 'borrow' ? i.status === 'canborrow'
            : i.status === 'skipped';

export default function MyStuff() {
  const data = useData();
  const nav = useNav();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [cat, setCat] = useState<Category | null>(null);

  const base = q.trim() ? search(data, q).items.map((h) => h.item) : data.items;
  const list = base.filter((i) => matchStatus(status, i) && (!cat || i.category === cat));
  const ts = terms(q);

  return (
    <div className="px-4">
      <header className="sticky top-0 z-10 -mx-4 bg-cream/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-bold">My Stuff</h1>
          <span className="pb-1 text-sm text-ink-faint">{data.items.filter((i) => i.status !== 'skipped').length} items</span>
        </div>
        <div className="relative mt-3">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            className={inputCls + ' pl-11 pr-11'} placeholder="Search name, brand, size…" value={q}
            onChange={(e) => setQ(e.target.value)} type="search" enterKeyHint="search"
          />
          {q && (
            <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-ink-faint">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {STATUS_FILTERS.map(([id, label]) => (
            <Chip key={id} active={status === id} onClick={() => setStatus(id)}>{label}</Chip>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className="min-h-[36px] text-sm">
              <c.icon size={15} /> {c.label}
            </Chip>
          ))}
        </div>
      </header>

      {data.items.length === 0 ? (
        <Empty
          icon={<Package size={26} />} title="Nothing here yet"
          body="Mark what you already have on the checklist, or add anything else in a few taps."
          action={<div className="flex flex-col gap-2">
            <Button onClick={() => nav.go('checklist')}>Open the checklist</Button>
            <Button variant="soft" onClick={() => nav.open({ kind: 'item' })}>Add an item</Button>
          </div>}
        />
      ) : list.length === 0 ? (
        <p className="py-12 text-center text-ink-soft">No matching items.</p>
      ) : (
        CATEGORIES.map((c) => {
          const group = list.filter((i) => i.category === c.id);
          if (!group.length) return null;
          return (
            <section key={c.id}>
              <h2 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">{c.label}</h2>
              <ul className="space-y-2.5">{group.map((i) => <ItemRow key={i.id} item={i} terms={ts} />)}</ul>
            </section>
          );
        })
      )}

      <button
        onClick={() => nav.open({ kind: 'item', preset: cat ? { category: cat } : undefined })}
        className="fixed bottom-24 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-sage-600 px-5 font-semibold text-white shadow-lg active:bg-sage-700"
      >
        <Plus size={22} /> Add item
      </button>
    </div>
  );
}
