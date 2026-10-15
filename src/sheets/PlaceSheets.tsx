import { ArrowRightLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { itemMeta } from '../components/ItemRow';
import ItemPicker from '../components/ItemPicker';
import { LocationChips } from '../components/PlacePicker';
import { Button, Field, PlaceLine, SectionTitle, Sheet, StatusPill, inputCls } from '../components/ui';
import { containerPlace, placeOf, sortRecent } from '../lib/derive';
import { useNav } from '../nav';
import { useData, useStore } from '../store';

export function ContainerSheet({ id }: { id: string }) {
  const data = useData();
  const store = useStore();
  const nav = useNav();
  const c = data.containers.find((x) => x.id === id);
  const [mode, setMode] = useState<'view' | 'edit' | 'move' | 'add'>('view');
  const [name, setName] = useState(c?.name ?? '');
  const [contents, setContents] = useState(c?.contents ?? '');
  const [spot, setSpot] = useState(c?.spot ?? '');
  const [moveTo, setMoveTo] = useState<string | undefined>(c?.locationId);
  const [moveSpot, setMoveSpot] = useState(c?.spot ?? '');
  const [picked, setPicked] = useState<string[]>([]);
  if (!c) return null;

  const items = data.items.filter((i) => i.containerId === c.id);

  const footer =
    mode === 'edit' ? (
      <Button className="mb-1 w-full" disabled={!name.trim()} onClick={() => {
        store.updateContainer(c.id, { name: name.trim(), contents: contents.trim(), spot: spot.trim() || undefined });
        setMode('view'); nav.toast('Saved');
      }}>Save</Button>
    ) : mode === 'move' ? (
      <Button className="mb-1 w-full" onClick={() => {
        store.moveContainer(c.id, moveTo, moveSpot.trim());
        const to = data.locations.find((l) => l.id === moveTo)?.name ?? 'no location';
        nav.toast(`Moved ${c.name} → ${to}`); setMode('view');
      }}>Move here</Button>
    ) : mode === 'add' ? (
      <Button className="mb-1 w-full" disabled={!picked.length} onClick={() => {
        store.assignToContainer(picked, c.id); setPicked([]); setMode('view');
        nav.toast(`Added to ${c.name}`);
      }}>Add {picked.length || ''} to {c.name}</Button>
    ) : undefined;

  return (
    <Sheet title={c.name} onClose={nav.close} footer={footer}>
      {mode === 'view' && (
        <>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-sand-200">
            <PlaceLine place={containerPlace(c, data)} strong />
            <p className="mt-3 text-sm font-semibold text-ink-faint">Contents</p>
            <p className="mt-0.5 whitespace-pre-wrap text-[17px]">{c.contents || <span className="text-ink-faint">No description yet</span>}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="soft" onClick={() => setMode('move')}><ArrowRightLeft size={18} /> Move</Button>
            <Button variant="soft" onClick={() => setMode('edit')}><Pencil size={18} /> Edit</Button>
          </div>

          <SectionTitle action={
            <button className="flex min-h-[40px] items-center gap-1 text-sm font-semibold text-sage-700" onClick={() => setMode('add')}>
              <Plus size={16} /> Add items
            </button>
          }>Items inside ({items.length})</SectionTitle>
          {items.length === 0 ? (
            <p className="text-sm text-ink-soft">No individual items linked. The description above is searchable either way.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-2 rounded-2xl bg-white py-1 pl-4 pr-1 ring-1 ring-sand-200">
                  <button className="min-h-[48px] min-w-0 flex-1 text-left" onClick={() => nav.open({ kind: 'item', id: i.id })}>
                    <span className="block font-medium">{i.name}</span>
                    {itemMeta(i) && <span className="block text-xs text-ink-faint">{itemMeta(i)}</span>}
                  </button>
                  <StatusPill status={i.status} />
                  <button aria-label={`Take ${i.name} out`} onClick={() => store.removeFromContainer(i.id)}
                    className="grid h-11 w-11 place-items-center rounded-full text-ink-faint active:bg-sand-100"><X size={18} /></button>
                </li>
              ))}
            </ul>
          )}

          <Button variant="danger" className="mt-8 w-full" onClick={() => {
            if (confirm(`Delete “${c.name}”? Items inside stay in My Stuff at ${containerPlace(c, data).location?.name ?? 'their last place'}.`)) {
              store.deleteContainer(c.id); nav.toast('Box deleted — items kept'); nav.close();
            }
          }}><Trash2 size={18} /> Delete box</Button>
        </>
      )}

      {mode === 'edit' && (
        <div className="space-y-4 pt-1">
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Spot" hint="optional"><input className={inputCls} value={spot} placeholder="e.g. Top shelf" onChange={(e) => setSpot(e.target.value)} /></Field>
          <Field label="What's inside?">
            <textarea className={inputCls + ' min-h-[120px]'} value={contents} onChange={(e) => setContents(e.target.value)} />
          </Field>
          <Button variant="ghost" className="w-full" onClick={() => setMode('view')}>Cancel</Button>
        </div>
      )}

      {mode === 'move' && (
        <div className="space-y-4 pt-1">
          <p className="text-ink-soft">Everything in {c.name} moves with it{items.length ? ` (${items.length} item${items.length > 1 ? 's' : ''})` : ''}.</p>
          <LocationChips value={moveTo} onChange={setMoveTo} />
          <Field label="Spot" hint="optional">
            <input className={inputCls} value={moveSpot} placeholder="e.g. Top shelf" onChange={(e) => setMoveSpot(e.target.value)} />
          </Field>
          <Button variant="ghost" className="w-full" onClick={() => setMode('view')}>Cancel</Button>
        </div>
      )}

      {mode === 'add' && (
        <div className="pt-1">
          <ItemPicker selected={picked} excludeContainerId={c.id}
            onToggle={(x) => setPicked((xs) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]))} />
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setMode('view')}>Cancel</Button>
        </div>
      )}
    </Sheet>
  );
}

export function LocationSheet({ id }: { id: string }) {
  const data = useData();
  const store = useStore();
  const nav = useNav();
  const loc = data.locations.find((l) => l.id === id);
  const [name, setName] = useState(loc?.name ?? '');
  const [renaming, setRenaming] = useState(false);
  if (!loc) return null;

  const boxes = sortRecent(data.containers.filter((c) => c.locationId === id));
  const loose = data.items.filter((i) => !i.containerId && i.locationId === id);

  return (
    <Sheet title={loc.name} onClose={nav.close}>
      {renaming ? (
        <div className="flex gap-2">
          <input className={inputCls} value={name} autoFocus onChange={(e) => setName(e.target.value)} />
          <Button onClick={() => { store.renameLocation(id, name); setRenaming(false); }}>Save</Button>
        </div>
      ) : (
        <Button variant="soft" className="w-full" onClick={() => setRenaming(true)}><Pencil size={18} /> Rename</Button>
      )}

      <SectionTitle>Boxes & bins ({boxes.length})</SectionTitle>
      {boxes.length === 0 && <p className="text-sm text-ink-soft">None here yet.</p>}
      <ul className="space-y-2">
        {boxes.map((c) => (
          <li key={c.id}>
            <button onClick={() => nav.open({ kind: 'container', id: c.id })}
              className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-sand-200 active:bg-sand-100">
              <span className="font-semibold">{c.name}</span>{c.spot && <span className="text-ink-faint"> · {c.spot}</span>}
              {c.contents && <span className="mt-0.5 block line-clamp-2 text-sm text-ink-soft">{c.contents}</span>}
            </button>
          </li>
        ))}
      </ul>

      <SectionTitle>Items stored here ({loose.length})</SectionTitle>
      {loose.length === 0 && <p className="text-sm text-ink-soft">No loose items.</p>}
      <ul className="space-y-2">
        {loose.map((i) => (
          <li key={i.id}>
            <button onClick={() => nav.open({ kind: 'item', id: i.id })}
              className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-sand-200 active:bg-sand-100">
              <span className="font-semibold">{i.name}</span>
              <span className="block"><PlaceLine place={placeOf(i, data)} /></span>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="danger" className="mt-8 w-full" onClick={() => {
        if (confirm(`Delete “${loc.name}”? Boxes and items stay in NestKit, just without a place.`)) {
          store.deleteLocation(id); nav.toast('Place deleted — nothing else removed'); nav.close();
        }
      }}><Trash2 size={18} /> Delete place</Button>
    </Sheet>
  );
}
