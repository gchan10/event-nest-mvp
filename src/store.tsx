import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CATALOG_BY_ID } from './data/catalog';
import { makeDemo } from './data/demo';
import { DECISIONS, isCovered } from './lib/meta';
import { migrate, storage, uid } from './lib/storage';
import {
  AppData, BabyProfile, ChecklistDecision, InventoryItem, Mode, SCHEMA_VERSION, StorageContainer,
} from './types';

const empty = (profile: BabyProfile): AppData => ({
  version: SCHEMA_VERSION, profile, items: [], locations: [], containers: [], preferences: [],
});

export type ItemInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;

export interface PutAwayInput {
  locationId?: string;
  newLocationName?: string;
  spot?: string;
  containerId?: string; // existing container to update
  newContainerName?: string;
  contents?: string;
  itemIds: string[];
}

function initial(): { mode: Mode | null; data: AppData | null } {
  const mode = storage.getMode();
  if (!mode) return { mode: null, data: null };
  const data = storage.load(mode) ?? (mode === 'demo' ? makeDemo() : null);
  return { mode, data };
}

function useStoreState() {
  const [{ mode, data }, setState] = useState(initial);

  useEffect(() => {
    if (mode && data) storage.save(mode, data);
  }, [mode, data]);

  const update = (fn: (d: AppData) => AppData) =>
    setState((s) => (s.data ? { ...s, data: fn(s.data) } : s));

  const now = () => Date.now();

  // Creates the location if needed (case-insensitive dedupe); returns its id.
  const ensureLocation = (d: AppData, name: string): [AppData, string] => {
    const clean = name.trim();
    const hit = d.locations.find((l) => l.name.toLowerCase() === clean.toLowerCase());
    if (hit) return [d, hit.id];
    const id = uid();
    return [{ ...d, locations: [...d.locations, { id, name: clean, lastUsedAt: now() }] }, id];
  };

  const touchLocation = (d: AppData, id?: string): AppData =>
    id ? { ...d, locations: d.locations.map((l) => (l.id === id ? { ...l, lastUsedAt: now() } : l)) } : d;

  const patchItems = (d: AppData, ids: string[], patch: Partial<InventoryItem>): AppData => ({
    ...d,
    items: d.items.map((i) => (ids.includes(i.id) ? { ...i, ...patch, updatedAt: now() } : i)),
  });

  const actions = {
    // ---- modes ----
    completeOnboarding(profile: BabyProfile) {
      storage.setMode('user');
      const existing = storage.load('user');
      setState({ mode: 'user', data: existing ? { ...existing, profile } : empty(profile) });
    },
    enterDemo() {
      storage.setMode('demo');
      setState({ mode: 'demo', data: storage.load('demo') ?? makeDemo() });
    },
    exitDemo() {
      storage.setMode('user');
      setState({ mode: 'user', data: storage.load('user') });
    },
    resetDemo() {
      if (mode !== 'demo') return;
      setState({ mode: 'demo', data: makeDemo() });
    },
    eraseMyData() {
      storage.clear('user');
      storage.setMode('user');
      setState({ mode: 'user', data: null });
    },
    importData(raw: unknown): boolean {
      const d = migrate(raw);
      if (!d) return false;
      storage.setMode('user');
      storage.save('user', d);
      setState({ mode: 'user', data: d });
      return true;
    },

    setProfile(profile: BabyProfile) { update((d) => ({ ...d, profile })); },

    // ---- inventory ----
    addItem(input: ItemInput): string {
      const id = uid();
      update((d) => touchLocation({
        ...d, items: [{ ...input, id, createdAt: now(), updatedAt: now() }, ...d.items],
      }, input.locationId));
      return id;
    },
    updateItem(id: string, patch: Partial<InventoryItem>) {
      update((d) => touchLocation(patchItems(d, [id], patch), patch.locationId));
    },
    deleteItem(id: string) { update((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })); },

    /** Checklist decisions write through to the linked inventory item(s). */
    setDecision(catalogId: string, decision: ChecklistDecision) {
      const status = DECISIONS.find((x) => x.id === decision)!.status;
      update((d) => {
        const linked = d.items.filter((i) => i.catalogId === catalogId);
        if (!linked.length) {
          const c = CATALOG_BY_ID[catalogId];
          const item: InventoryItem = {
            id: uid(), name: c.name, category: c.category, quantity: 1, status, catalogId,
            createdAt: now(), updatedAt: now(),
          };
          return { ...d, items: [item, ...d.items] };
        }
        return {
          ...d,
          items: d.items.map((i) => {
            if (i.catalogId !== catalogId) return i;
            if (decision === 'have' && isCovered(i.status)) return i;
            return { ...i, status, updatedAt: now() };
          }),
        };
      });
    },

    // ---- locations ----
    addLocation(name: string): string {
      const clean = name.trim();
      const hit = data?.locations.find((l) => l.name.toLowerCase() === clean.toLowerCase());
      if (hit) return hit.id;
      const id = uid();
      update((d) => ({ ...d, locations: [...d.locations, { id, name: clean, lastUsedAt: now() }] }));
      return id;
    },
    renameLocation(id: string, name: string) {
      if (!name.trim()) return;
      update((d) => ({ ...d, locations: d.locations.map((l) => (l.id === id ? { ...l, name: name.trim() } : l)) }));
    },
    /** Never deletes items or boxes: they just become unplaced. */
    deleteLocation(id: string) {
      update((d) => ({
        ...d,
        locations: d.locations.filter((l) => l.id !== id),
        containers: d.containers.map((c) => (c.locationId === id ? { ...c, locationId: undefined, spot: undefined } : c)),
        items: d.items.map((i) => (i.locationId === id ? { ...i, locationId: undefined, spot: undefined } : i)),
      }));
    },

    // ---- containers ----
    updateContainer(id: string, patch: Partial<StorageContainer>) {
      update((d) => touchLocation({
        ...d,
        containers: d.containers.map((c) => (c.id === id ? { ...c, ...patch, lastUsedAt: now() } : c)),
      }, patch.locationId));
    },
    /** Moving a box moves everything in it: items reference the box, not the location. */
    moveContainer(id: string, locationId: string | undefined, spot?: string) {
      actions.updateContainer(id, { locationId, spot: spot || undefined });
    },
    /** Items keep the box's last location so nothing gets lost. */
    deleteContainer(id: string) {
      update((d) => {
        const c = d.containers.find((x) => x.id === id);
        return {
          ...d,
          containers: d.containers.filter((x) => x.id !== id),
          items: d.items.map((i) =>
            i.containerId === id ? { ...i, containerId: undefined, locationId: c?.locationId, spot: c?.spot } : i),
        };
      });
    },
    assignToContainer(itemIds: string[], containerId: string) {
      update((d) => patchItems(d, itemIds, { containerId, locationId: undefined, spot: undefined }));
    },
    removeFromContainer(itemId: string) {
      update((d) => {
        const item = d.items.find((i) => i.id === itemId);
        const c = d.containers.find((x) => x.id === item?.containerId);
        return patchItems(d, [itemId], { containerId: undefined, locationId: c?.locationId, spot: c?.spot });
      });
    },

    /** The whole Put Away flow in one atomic update. Returns a short summary. */
    putAway(input: PutAwayInput) {
      update((d0) => {
        let d = d0;
        let locationId = input.locationId;
        if (!locationId && input.newLocationName?.trim()) [d, locationId] = ensureLocation(d, input.newLocationName);
        const spot = input.spot?.trim() || undefined;
        const contents = input.contents?.trim() ?? '';
        let containerId = input.containerId;
        const boxName = input.newContainerName?.trim();
        if (!containerId && boxName) {
          const existing = d.containers.find(
            (c) => c.name.toLowerCase() === boxName.toLowerCase() && c.locationId === locationId);
          containerId = existing?.id;
          if (!existing) {
            containerId = uid();
            d = { ...d, containers: [...d.containers, {
              id: containerId, name: boxName, locationId, spot, contents, createdAt: now(), lastUsedAt: now(),
            }] };
          }
        }
        if (!containerId && contents) {
          // Free text with no box named: keep it as one described spot, never as many items.
          const name = spot || 'Loose items';
          const existing = d.containers.find((c) => c.name === name && c.locationId === locationId);
          if (existing) {
            containerId = existing.id;
            d = { ...d, containers: d.containers.map((c) => c.id === existing.id
              ? { ...c, contents: [c.contents, contents].filter(Boolean).join(', '), lastUsedAt: now() } : c) };
          } else {
            containerId = uid();
            d = { ...d, containers: [...d.containers, {
              id: containerId, name, locationId, contents, createdAt: now(), lastUsedAt: now(),
            }] };
          }
        } else if (containerId) {
          d = { ...d, containers: d.containers.map((c) => c.id === containerId
            ? { ...c, locationId, spot, contents: contents || c.contents, lastUsedAt: now() } : c) };
        }
        d = containerId
          ? patchItems(d, input.itemIds, { containerId, locationId: undefined, spot: undefined })
          : patchItems(d, input.itemIds, { containerId: undefined, locationId, spot });
        return touchLocation(d, locationId);
      });
    },

    // ---- preferences ----
    addPreference(text: string) {
      if (!text.trim()) return;
      update((d) => ({ ...d, preferences: [...d.preferences, { id: uid(), text: text.trim() }] }));
    },
    removePreference(id: string) {
      update((d) => ({ ...d, preferences: d.preferences.filter((p) => p.id !== id) }));
    },
  };

  return { mode, data, ...actions };
}

type Store = ReturnType<typeof useStoreState>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreState();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
}

/** For screens that render only after onboarding. */
export function useData() {
  const s = useStore();
  return useMemo(() => s.data!, [s.data]);
}
