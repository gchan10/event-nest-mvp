import { Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ItemPicker from '../components/ItemPicker';
import { LocationChips } from '../components/PlacePicker';
import { Button, Chip, Field, PlaceLine, SectionTitle, inputCls } from '../components/ui';
import { containerPlace, sortRecent } from '../lib/derive';
import { useNav } from '../nav';
import { useData, useStore } from '../store';

export default function PutAway() {
  const data = useData();
  const { putAway } = useStore();
  const nav = useNav();

  const recentLoc = sortRecent(data.locations)[0]?.id;
  const [locationId, setLocationId] = useState<string | undefined>(recentLoc);
  const [spot, setSpot] = useState('');
  const [box, setBox] = useState('');
  const [contents, setContents] = useState('');
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);

  // If the remembered location gets deleted, fall back.
  useEffect(() => {
    if (locationId && !data.locations.some((l) => l.id === locationId)) setLocationId(recentLoc);
  }, [data.locations, locationId, recentLoc]);

  const location = data.locations.find((l) => l.id === locationId);
  const boxesHere = sortRecent(data.containers.filter((c) => c.locationId === locationId));
  const matchedBox = useMemo(
    () => boxesHere.find((c) => c.name.toLowerCase() === box.trim().toLowerCase()),
    [boxesHere, box]);
  const spotsHere = [...new Set([
    ...data.containers.filter((c) => c.locationId === locationId).map((c) => c.spot),
    ...data.items.filter((i) => i.locationId === locationId).map((i) => i.spot),
  ].filter((s): s is string => Boolean(s)))];

  const pickBox = (id: string) => {
    const c = data.containers.find((x) => x.id === id)!;
    if (matchedBox?.id === id) { setBox(''); setContents(''); setSpot(''); return; }
    setBox(c.name);
    setContents(c.contents);
    setSpot(c.spot ?? '');
  };

  const canSave = Boolean(locationId) && Boolean(box.trim() || contents.trim() || itemIds.length);

  const save = () => {
    if (!canSave) return;
    putAway({
      locationId, spot, contents, itemIds,
      containerId: matchedBox?.id,
      newContainerName: matchedBox ? undefined : box,
    });
    const label = [box.trim() || (contents.trim() ? spot.trim() || 'Loose items' : ''), location?.name].filter(Boolean).join(' → ');
    nav.toast(`Put away: ${label || location?.name}`);
    setBox(''); setContents(''); setItemIds([]); setSpot(''); setPicking(false);
  };

  const recent = sortRecent(data.containers).slice(0, 5);

  return (
    <div className="px-4 pt-4">
      <h1 className="text-3xl font-bold">Put Away</h1>
      <p className="mt-1 text-ink-soft">Log a box, bin or drawer in a few seconds.</p>

      <div className="mt-5 space-y-6 rounded-3xl bg-white p-4 ring-1 ring-sand-200">
        <Field label="1. Where?">
          <div className="pt-0.5"><LocationChips value={locationId} onChange={setLocationId} /></div>
        </Field>

        <Field label="2. Box, bin or drawer" hint="optional">
          <input className={inputCls} placeholder="e.g. Box 3" value={box} onChange={(e) => setBox(e.target.value)} />
          {boxesHere.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {boxesHere.slice(0, 8).map((c) => (
                <Chip key={c.id} active={matchedBox?.id === c.id} onClick={() => pickBox(c.id)} className="min-h-[36px] text-sm">
                  {c.name}
                </Chip>
              ))}
            </div>
          )}
          {matchedBox && <p className="mt-2 text-sm text-sage-700">Updating existing “{matchedBox.name}”.</p>}
        </Field>

        <Field label="Spot" hint="optional">
          <input className={inputCls} placeholder="e.g. Top shelf" value={spot} onChange={(e) => setSpot(e.target.value)} />
          {spotsHere.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {spotsHere.map((s) => (
                <Chip key={s} active={spot === s} onClick={() => setSpot(spot === s ? '' : s)} className="min-h-[36px] text-sm">{s}</Chip>
              ))}
            </div>
          )}
        </Field>

        <Field label="3. What's inside?">
          <textarea
            className={inputCls + ' min-h-[96px]'} value={contents}
            placeholder="e.g. 0–3 month clothes, extra swaddles, newborn hats"
            onChange={(e) => setContents(e.target.value)}
          />
        </Field>

        <div>
          <button type="button" onClick={() => setPicking(!picking)}
            className="flex min-h-[48px] w-full items-center justify-between rounded-2xl bg-sand-100 px-4 font-semibold text-ink-soft">
            <span>Also add items from My Stuff{itemIds.length ? ` (${itemIds.length})` : ''}</span>
            {picking ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {picking && (
            <div className="mt-2">
              <ItemPicker selected={itemIds}
                onToggle={(id) => setItemIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))} />
            </div>
          )}
        </div>

        <Button className="w-full" disabled={!canSave} onClick={save}>
          <Archive size={20} /> Save
        </Button>
        {!locationId && <p className="-mt-3 text-center text-sm text-ink-faint">Pick or add a place first.</p>}
      </div>

      {recent.length > 0 && (
        <>
          <SectionTitle>Recently put away</SectionTitle>
          <ul className="space-y-2.5">
            {recent.map((c) => (
              <li key={c.id}>
                <button onClick={() => nav.open({ kind: 'container', id: c.id })}
                  className="w-full rounded-3xl bg-white p-4 text-left ring-1 ring-sand-200 active:bg-sand-100">
                  <PlaceLine place={containerPlace(c, data)} strong />
                  {c.contents && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{c.contents}</p>}
                  <p className="mt-2 text-sm font-semibold text-sage-700">Open · Move</p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
