import { Minus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PlacePicker } from '../components/PlacePicker';
import { Button, Chip, Field, Sheet, inputCls } from '../components/ui';
import { CATALOG } from '../data/catalog';
import { CATEGORIES, STATUSES } from '../lib/meta';
import { normalize } from '../lib/search';
import { useNav } from '../nav';
import { ItemInput, useData, useStore } from '../store';
import { Status } from '../types';

// Remember the last status/place used when adding, so the next add is faster.
const LAST_KEY = 'nestkit:ui:lastAdd';
function readLast(): { status?: Status; locationId?: string } {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) || '{}'); } catch { return {}; }
}

export default function ItemSheet({ id, preset }: { id?: string; preset?: Partial<ItemInput> }) {
  const data = useData();
  const { addItem, updateItem, deleteItem } = useStore();
  const nav = useNav();
  const existing = id ? data.items.find((i) => i.id === id) : undefined;

  const [f, setF] = useState<ItemInput>(() => {
    if (existing) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = existing;
      return rest;
    }
    const last = readLast();
    const lastLoc = data.locations.some((l) => l.id === last.locationId) ? last.locationId : undefined;
    return { name: '', category: 'other', quantity: 1, status: last.status ?? 'purchased', locationId: lastLoc, ...preset };
  });
  const set = (patch: Partial<ItemInput>) => setF((x) => ({ ...x, ...patch }));

  const suggestions = useMemo(() => {
    const q = normalize(f.name.trim());
    if (existing || f.catalogId || q.length < 2) return [];
    return CATALOG.filter((c) => normalize(c.name).includes(q)).slice(0, 4);
  }, [f.name, f.catalogId, existing]);

  if (id && !existing) return null;

  const save = () => {
    const clean: ItemInput = {
      ...f, name: f.name.trim(), brand: f.brand?.trim() || undefined, size: f.size?.trim() || undefined,
      notes: f.notes?.trim() || undefined, spot: f.spot?.trim() || undefined,
    };
    if (existing) {
      updateItem(existing.id, clean);
      nav.toast('Saved');
    } else {
      addItem(clean);
      try { localStorage.setItem(LAST_KEY, JSON.stringify({ status: clean.status, locationId: clean.locationId })); } catch { /* ignore */ }
      nav.toast(`Added ${clean.name}`);
    }
    nav.close();
  };

  return (
    <Sheet
      title={existing ? 'Edit item' : 'Add item'}
      onClose={nav.close}
      footer={
        <div className="flex gap-2 pb-1">
          {existing && (
            <Button variant="danger" aria-label="Delete item" onClick={() => {
              if (confirm(`Delete “${existing.name}”?`)) { deleteItem(existing.id); nav.toast('Deleted'); nav.close(); }
            }}><Trash2 size={20} /></Button>
          )}
          <Button className="flex-1" disabled={!f.name.trim()} onClick={save}>{existing ? 'Save' : 'Add item'}</Button>
        </div>
      }
    >
      <div className="space-y-5 pt-1">
        <Field label="What is it?">
          <input
            className={inputCls} value={f.name} placeholder="e.g. Swaddles" autoFocus={!existing}
            onChange={(e) => set({ name: e.target.value, catalogId: existing ? f.catalogId : undefined })}
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((c) => (
                <Chip key={c.id} className="min-h-[36px] text-sm"
                  onClick={() => set({ name: c.name, category: c.category, catalogId: c.id })}>
                  {c.name}
                </Chip>
              ))}
            </div>
          )}
        </Field>

        <Field label="Status">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Chip key={s.id} active={f.status === s.id} onClick={() => set({ status: s.id })}>{s.label}</Chip>
            ))}
          </div>
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={f.category === c.id} onClick={() => set({ category: c.id })}>
                <c.icon size={15} /> {c.label}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand" hint="optional">
            <input className={inputCls} value={f.brand ?? ''} placeholder="e.g. Coterie" onChange={(e) => set({ brand: e.target.value })} />
          </Field>
          <Field label="Size" hint="optional">
            <input className={inputCls} value={f.size ?? ''} placeholder="e.g. 0–3m" onChange={(e) => set({ size: e.target.value })} />
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Quantity</span>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Less" onClick={() => set({ quantity: Math.max(1, f.quantity - 1) })}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-white ring-1 ring-sand-200 active:bg-sand-100"><Minus size={20} /></button>
            <span className="w-10 text-center text-xl font-semibold">{f.quantity}</span>
            <button type="button" aria-label="More" onClick={() => set({ quantity: f.quantity + 1 })}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-white ring-1 ring-sand-200 active:bg-sand-100"><Plus size={20} /></button>
          </div>
        </div>

        <Field label="Where is it?" hint="optional">
          <div className="pt-0.5">
            <PlacePicker
              value={{ locationId: f.locationId, containerId: f.containerId, spot: f.spot }}
              onChange={(v) => set(v)}
            />
          </div>
        </Field>

        <Field label="Notes & preferences" hint="optional">
          <textarea
            className={inputCls + ' min-h-[88px]'} value={f.notes ?? ''}
            placeholder="e.g. Runs small · Prefer fragrance-free · Return to Sam by June"
            onChange={(e) => set({ notes: e.target.value })}
          />
        </Field>
      </div>
    </Sheet>
  );
}
