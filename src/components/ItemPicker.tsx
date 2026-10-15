import { Check, Search } from 'lucide-react';
import { useState } from 'react';
import { placeOf, whereLabel } from '../lib/derive';
import { search } from '../lib/search';
import { useData } from '../store';
import { itemMeta } from './ItemRow';
import { cx, inputCls } from './ui';

/** Pick existing inventory items (so nothing gets entered twice). */
export default function ItemPicker({ selected, onToggle, excludeContainerId }: {
  selected: string[]; onToggle: (id: string) => void; excludeContainerId?: string;
}) {
  const data = useData();
  const [q, setQ] = useState('');
  const pool = (q.trim() ? search(data, q).items.map((h) => h.item) : data.items)
    .filter((i) => i.status !== 'skipped' && i.status !== 'need' && i.status !== 'registry' && i.status !== 'canborrow')
    .filter((i) => !excludeContainerId || i.containerId !== excludeContainerId);

  return (
    <div className="rounded-3xl bg-sand-100 p-3">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input className={inputCls + ' pl-11'} placeholder="Find in My Stuff" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
        {pool.length === 0 && <li className="px-2 py-4 text-center text-sm text-ink-soft">No items you have yet. Mark items as “Have it” first.</li>}
        {pool.map((i) => {
          const on = selected.includes(i.id);
          const p = placeOf(i, data);
          const where = [p.container?.name, whereLabel(p)].filter(Boolean).join(' · ');
          return (
            <li key={i.id}>
              <button type="button" onClick={() => onToggle(i.id)}
                className={cx('flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1',
                  on ? 'bg-sage-50 ring-sage-500' : 'bg-white ring-sand-200')}>
                <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-lg ring-1',
                  on ? 'bg-sage-600 text-white ring-sage-600' : 'bg-white ring-sand-300')}>
                  {on && <Check size={16} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{i.name}</span>
                  <span className="block truncate text-xs text-ink-faint">{[itemMeta(i), where && `in ${where}`].filter(Boolean).join(' · ')}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
