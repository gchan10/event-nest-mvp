import { Plus } from 'lucide-react';
import { useState } from 'react';
import { sortRecent } from '../lib/derive';
import { LOCATION_SUGGESTIONS } from '../lib/meta';
import { useData, useStore } from '../store';
import { Chip, inputCls } from './ui';

/** Location chips (recent first) with inline "new place" creation. */
export function LocationChips({ value, onChange, allowNone }: {
  value?: string; onChange: (id: string | undefined) => void; allowNone?: boolean;
}) {
  const data = useData();
  const { addLocation } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const locs = sortRecent(data.locations);
  const suggestions = LOCATION_SUGGESTIONS.filter(
    (s) => !data.locations.some((l) => l.name.toLowerCase() === s.toLowerCase()));

  const create = (n: string) => {
    if (!n.trim()) return;
    onChange(addLocation(n));
    setAdding(false);
    setName('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allowNone && <Chip active={!value} onClick={() => onChange(undefined)}>Not set</Chip>}
        {locs.map((l) => (
          <Chip key={l.id} active={value === l.id} onClick={() => onChange(value === l.id && allowNone ? undefined : l.id)}>
            {l.name}
          </Chip>
        ))}
        {!adding && (
          <Chip onClick={() => setAdding(true)} className="text-sage-700"><Plus size={16} /> New place</Chip>
        )}
      </div>
      {(adding || locs.length === 0) && (
        <div className="mt-3 rounded-2xl bg-sand-100 p-3">
          <div className="flex gap-2">
            <input
              className={inputCls} placeholder="e.g. Hall closet" value={name} autoFocus={adding}
              onChange={(e) => setName(e.target.value)} enterKeyHint="done"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); create(name); } }}
            />
            <button type="button" onClick={() => create(name)} disabled={!name.trim()}
              className="min-h-[48px] shrink-0 rounded-2xl bg-sage-600 px-4 font-semibold text-white disabled:opacity-40">
              Add
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Chip key={s} onClick={() => create(s)} className="min-h-[36px] text-sm"><Plus size={14} /> {s}</Chip>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Location + optional box/bin + optional spot, for a single item. */
export function PlacePicker({ value, onChange }: {
  value: { locationId?: string; containerId?: string; spot?: string };
  onChange: (v: { locationId?: string; containerId?: string; spot?: string }) => void;
}) {
  const data = useData();
  const container = data.containers.find((c) => c.id === value.containerId);
  const locationId = container ? container.locationId : value.locationId;
  const boxes = sortRecent(data.containers.filter((c) => c.locationId === locationId));

  return (
    <div className="space-y-3">
      <LocationChips
        allowNone value={locationId}
        onChange={(id) => onChange({ locationId: id, containerId: undefined, spot: value.spot })}
      />
      {locationId && boxes.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm text-ink-faint">In a box or bin?</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!value.containerId} onClick={() => onChange({ locationId, containerId: undefined, spot: value.spot })}>No</Chip>
            {boxes.map((b) => (
              <Chip key={b.id} active={value.containerId === b.id}
                onClick={() => onChange({ locationId: undefined, containerId: b.id, spot: undefined })}>
                {b.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {locationId && !value.containerId && (
        <input
          className={inputCls} placeholder="Spot (optional) — e.g. Top shelf" value={value.spot ?? ''}
          onChange={(e) => onChange({ locationId, containerId: undefined, spot: e.target.value })}
        />
      )}
    </div>
  );
}
