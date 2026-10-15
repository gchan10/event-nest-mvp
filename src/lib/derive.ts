// Pure selectors: everything the UI shows is computed from AppData.
import { CATALOG } from '../data/catalog';
import {
  AppData, BabyProfile, CatalogItem, ChecklistDecision, InventoryItem,
  StorageContainer, StorageLocation,
} from '../types';
import { isCovered } from './meta';

export function decisionFor(catalogId: string, items: InventoryItem[]): ChecklistDecision | undefined {
  const linked = items.filter((i) => i.catalogId === catalogId);
  if (!linked.length) return undefined;
  const has = (s: InventoryItem['status']) => linked.some((i) => i.status === s);
  if (linked.some((i) => isCovered(i.status))) return 'have';
  if (has('registry')) return 'registry';
  if (has('canborrow')) return 'borrow';
  if (has('need')) return 'need';
  return 'skip';
}

export interface Place {
  location?: StorageLocation;
  spot?: string;
  container?: StorageContainer;
}

export function placeOf(item: InventoryItem, data: AppData): Place {
  const container = item.containerId ? data.containers.find((c) => c.id === item.containerId) : undefined;
  if (container) return containerPlace(container, data);
  return {
    location: data.locations.find((l) => l.id === item.locationId),
    spot: item.spot || undefined,
  };
}

export function containerPlace(c: StorageContainer, data: AppData): Place {
  return { container: c, location: data.locations.find((l) => l.id === c.locationId), spot: c.spot || undefined };
}

/** "Bedroom closet → Top shelf" */
export function whereLabel(p: Pick<Place, 'location' | 'spot'>): string {
  return [p.location?.name, p.spot].filter(Boolean).join(' → ');
}

export function hasPlace(p: Place) {
  return Boolean(p.location || p.spot || p.container);
}

/** Age in months (negative while expecting). null if no date. */
export function ageMonths(profile: BabyProfile, now = new Date()): number | null {
  if (!profile.date) return null;
  const d = new Date(profile.date + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

export function ageLabel(profile: BabyProfile, now = new Date()): string {
  if (!profile.date) return profile.dateType === 'due' ? 'Getting ready' : '';
  const d = new Date(profile.date + 'T00:00:00');
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days < 0) {
    const left = -days;
    if (left <= 1) return left === 1 ? 'Due tomorrow' : 'Due today';
    if (left < 21) return `Due in ${left} days`;
    return `Due in ${Math.round(left / 7)} weeks`;
  }
  if (profile.dateType === 'due' && days === 0) return 'Due today';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} old`;
  const months = Math.floor(days / 30.4375);
  if (months < 2) return `${Math.floor(days / 7)} weeks old`;
  if (months < 24) return `${months} months old`;
  return `${Math.floor(months / 12)} years old`;
}

/** Catalog entries relevant now: up to the current age window (or newborn while expecting). */
export function currentNeeds(data: AppData, now = new Date()) {
  const age = Math.max(0, ageMonths(data.profile, now) ?? 0);
  return CATALOG.filter((c) => c.startMonth <= age);
}

export function essentialsProgress(data: AppData, now = new Date()) {
  const relevant = currentNeeds(data, now).filter((c) => c.priority === 'essential');
  const decided = relevant.map((c) => ({ c, d: decisionFor(c.id, data.items) }));
  const counted = decided.filter((x) => x.d !== 'skip');
  return { covered: counted.filter((x) => x.d === 'have').length, total: counted.length };
}

const PRIORITY_RANK = { essential: 0, useful: 1, optional: 2 };

export function missingNow(data: AppData, now = new Date()) {
  return currentNeeds(data, now)
    .filter((c) => c.priority !== 'optional')
    .map((c) => ({ c, d: decisionFor(c.id, data.items) }))
    .filter((x) => x.d !== 'have' && x.d !== 'skip')
    .sort((a, b) => PRIORITY_RANK[a.c.priority] - PRIORITY_RANK[b.c.priority]);
}

/** Next ~4 months of gear, grouped by age window. */
export function comingUp(data: AppData, now = new Date()) {
  const age = ageMonths(data.profile, now);
  const from = Math.max(0, age ?? 0);
  const groups = new Map<string, { label: string; entries: { c: CatalogItem; d?: ChecklistDecision }[] }>();
  for (const c of CATALOG) {
    if (c.startMonth <= from || c.startMonth > from + 4.5) continue;
    if (c.priority === 'optional') continue;
    const d = decisionFor(c.id, data.items);
    if (d === 'skip') continue;
    const g = groups.get(c.ageLabel) ?? { label: c.ageLabel, entries: [] };
    g.entries.push({ c, d });
    groups.set(c.ageLabel, g);
  }
  return [...groups.values()];
}

export function sortRecent<T extends { lastUsedAt: number; name: string }>(xs: T[]) {
  return [...xs].sort((a, b) => b.lastUsedAt - a.lastUsedAt || a.name.localeCompare(b.name));
}
