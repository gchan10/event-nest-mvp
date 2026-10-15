import { AppData, InventoryItem, StorageContainer } from '../types';
import { CATEGORY_BY_ID, STATUS_BY_ID } from './meta';

export const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[–—]/g, '-');

/** Query terms, loosely singularised so "swaddles" also matches "swaddle". */
export function terms(q: string): string[] {
  return normalize(q)
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t));
}

const matchesAll = (hay: string, ts: string[]) => ts.every((t) => hay.includes(t));

export interface ItemHit { kind: 'item'; item: InventoryItem }
export interface ContainerHit { kind: 'container'; container: StorageContainer; inContents: boolean }

export function search(data: AppData, q: string) {
  const ts = terms(q);
  if (!ts.length) return { items: [] as ItemHit[], containers: [] as ContainerHit[] };
  const locName = (id?: string) => data.locations.find((l) => l.id === id)?.name ?? '';
  const cont = (id?: string) => data.containers.find((c) => c.id === id);

  const items: ItemHit[] = data.items
    .filter((i) => {
      const c = cont(i.containerId);
      const hay = normalize([
        i.name, i.brand, i.size, i.notes,
        CATEGORY_BY_ID[i.category]?.label, STATUS_BY_ID[i.status]?.label,
        c ? `${c.name} ${c.spot ?? ''} ${locName(c.locationId)}` : `${locName(i.locationId)} ${i.spot ?? ''}`,
      ].filter(Boolean).join(' '));
      return matchesAll(hay, ts);
    })
    .sort((a, b) => Number(a.status === 'skipped') - Number(b.status === 'skipped'))
    .map((item): ItemHit => ({ kind: 'item', item }));

  const containers: ContainerHit[] = data.containers
    .filter((c) => matchesAll(normalize(`${c.name} ${c.spot ?? ''} ${locName(c.locationId)} ${c.contents}`), ts))
    .map((container): ContainerHit => {
      const meta = normalize(`${container.name} ${container.spot ?? ''} ${locName(container.locationId)}`);
      return { kind: 'container', container, inContents: !matchesAll(meta, ts) };
    });

  return { items, containers };
}
