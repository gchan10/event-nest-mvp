// Persistence adapter. This is the only module that touches localStorage,
// so swapping in Supabase later means replacing these functions.
import { AppData, Mode, SCHEMA_VERSION } from '../types';

const DATA_KEY = (mode: Mode) => `nestkit:data:${mode}`;
const MODE_KEY = 'nestkit:mode';

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage full or blocked */ }
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Bring any stored/imported shape up to the current schema, filling defaults. */
export function migrate(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const version = typeof r.version === 'number' ? r.version : 0;
  if (version > SCHEMA_VERSION) return null;
  // v0 -> v1: no prior releases; just normalise fields.
  const p = (r.profile ?? {}) as Record<string, unknown>;
  const now = Date.now();
  return {
    version: SCHEMA_VERSION,
    profile: {
      name: typeof p.name === 'string' ? p.name : '',
      dateType: p.dateType === 'birth' ? 'birth' : 'due',
      date: typeof p.date === 'string' ? p.date : '',
    },
    items: arr<AppData['items'][number]>(r.items)
      .filter((i) => i && typeof i.id === 'string' && typeof i.name === 'string')
      .map((i) => ({
        ...i,
        quantity: Number(i.quantity) > 0 ? Number(i.quantity) : 1,
        category: i.category ?? 'other',
        status: i.status ?? 'need',
        createdAt: i.createdAt ?? now,
        updatedAt: i.updatedAt ?? now,
      })),
    locations: arr<AppData['locations'][number]>(r.locations)
      .filter((l) => l && typeof l.id === 'string' && typeof l.name === 'string')
      .map((l) => ({ ...l, lastUsedAt: l.lastUsedAt ?? 0 })),
    containers: arr<AppData['containers'][number]>(r.containers)
      .filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string')
      .map((c) => ({ ...c, contents: c.contents ?? '', createdAt: c.createdAt ?? now, lastUsedAt: c.lastUsedAt ?? 0 })),
    preferences: arr<AppData['preferences'][number]>(r.preferences)
      .filter((x) => x && typeof x.text === 'string'),
  };
}

export const storage = {
  getMode(): Mode | null {
    const m = safeGet(MODE_KEY);
    return m === 'user' || m === 'demo' ? m : null;
  },
  setMode(mode: Mode) { safeSet(MODE_KEY, mode); },
  load(mode: Mode): AppData | null {
    const s = safeGet(DATA_KEY(mode));
    if (!s) return null;
    try { return migrate(JSON.parse(s)); } catch { return null; }
  },
  save(mode: Mode, data: AppData) { safeSet(DATA_KEY(mode), JSON.stringify(data)); },
  clear(mode: Mode) { try { localStorage.removeItem(DATA_KEY(mode)); } catch { /* ignore */ } },
};

export const uid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
