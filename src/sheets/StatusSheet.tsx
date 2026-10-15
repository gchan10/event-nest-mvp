import { Check } from 'lucide-react';
import { Sheet, cx } from '../components/ui';
import { STATUSES } from '../lib/meta';
import { useNav } from '../nav';
import { useData, useStore } from '../store';

/** One-tap status change without opening the edit form. */
export default function StatusSheet({ id }: { id: string }) {
  const data = useData();
  const { updateItem } = useStore();
  const nav = useNav();
  const item = data.items.find((i) => i.id === id);
  if (!item) return null;
  return (
    <Sheet title={item.name} onClose={nav.close}>
      <div className="grid grid-cols-2 gap-2 pb-4">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => { updateItem(id, { status: s.id }); nav.close(); }}
            className={cx(
              'flex min-h-[56px] items-center justify-between rounded-2xl px-4 text-left text-base font-semibold ring-1',
              item.status === s.id ? s.tone + ' ring-2' : 'bg-white ring-sand-200 active:bg-sand-100',
            )}
          >
            {s.label}
            {item.status === s.id && <Check size={18} />}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
