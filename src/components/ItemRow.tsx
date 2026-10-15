import { hasPlace, placeOf } from '../lib/derive';
import { useNav } from '../nav';
import { useData } from '../store';
import { InventoryItem } from '../types';
import { CategoryIcon, Highlight, PlaceLine, StatusPill } from './ui';

export function itemMeta(i: InventoryItem) {
  return [i.brand, i.size, i.quantity > 1 ? `×${i.quantity}` : ''].filter(Boolean).join(' · ');
}

export default function ItemRow({ item, terms = [], placeStrong }: {
  item: InventoryItem; terms?: string[]; placeStrong?: boolean;
}) {
  const data = useData();
  const nav = useNav();
  const place = placeOf(item, data);
  const meta = itemMeta(item);
  return (
    <li>
      <div
        role="button" tabIndex={0}
        onClick={() => nav.open({ kind: 'item', id: item.id })}
        onKeyDown={(e) => e.key === 'Enter' && nav.open({ kind: 'item', id: item.id })}
        className="flex w-full gap-3 rounded-3xl bg-white p-4 text-left ring-1 ring-sand-200 active:bg-sand-100"
      >
        <CategoryIcon category={item.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[17px] font-semibold leading-snug"><Highlight text={item.name} terms={terms} /></p>
              {meta && <p className="text-sm text-ink-soft"><Highlight text={meta} terms={terms} /></p>}
            </div>
            <StatusPill status={item.status} onClick={() => nav.open({ kind: 'status', id: item.id })} />
          </div>
          {hasPlace(place) && <div className="mt-1.5"><PlaceLine place={place} strong={placeStrong} /></div>}
          {item.notes && <p className="mt-1 line-clamp-2 text-sm italic text-ink-faint"><Highlight text={item.notes} terms={terms} /></p>}
        </div>
      </div>
    </li>
  );
}
