import { Archive, ChevronRight, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ItemRow from '../components/ItemRow';
import { Button, Empty, Highlight, PlaceLine, SectionTitle, inputCls } from '../components/ui';
import { containerPlace, sortRecent } from '../lib/derive';
import { search, terms } from '../lib/search';
import { useNav } from '../nav';
import { useData } from '../store';

export default function Find() {
  const data = useData();
  const nav = useNav();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const res = search(data, q);
  const ts = terms(q);
  const hasQuery = Boolean(q.trim());

  return (
    <div className="px-4">
      <header className="sticky top-0 z-10 -mx-4 bg-cream/95 px-4 pb-3 pt-4 backdrop-blur">
        <h1 className="text-3xl font-bold">Find</h1>
        <div className="relative mt-3">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-600" />
          <input
            ref={input} type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Swaddles, Box 3, garage…"
            className={inputCls + ' py-4 pl-12 pr-12 text-lg ring-2 ring-sage-200'}
          />
          {q && (
            <button aria-label="Clear" onClick={() => { setQ(''); input.current?.focus(); }}
              className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-ink-faint">
              <X size={22} />
            </button>
          )}
        </div>
      </header>

      {hasQuery ? (
        <>
          {res.items.length === 0 && res.containers.length === 0 && (
            <p className="py-12 text-center text-ink-soft">Nothing matches “{q.trim()}”.</p>
          )}
          {res.items.length > 0 && (
            <>
              <SectionTitle>Items ({res.items.length})</SectionTitle>
              <ul className="space-y-2.5">
                {res.items.map((h) => <ItemRow key={h.item.id} item={h.item} terms={ts} placeStrong />)}
              </ul>
            </>
          )}
          {res.containers.length > 0 && (
            <>
              <SectionTitle>Boxes & bins ({res.containers.length})</SectionTitle>
              <ul className="space-y-2.5">
                {res.containers.map(({ container: c, inContents }) => (
                  <li key={c.id}>
                    <button onClick={() => nav.open({ kind: 'container', id: c.id })}
                      className="w-full rounded-3xl bg-white p-4 text-left ring-1 ring-sand-200 active:bg-sand-100">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-lg font-semibold"><Highlight text={c.name} terms={ts} /></p>
                        {inContents && (
                          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                            Found in box contents
                          </span>
                        )}
                      </div>
                      <div className="mt-1"><PlaceLine place={{ ...containerPlace(c, data), container: undefined }} strong /></div>
                      {!c.locationId && <p className="text-sm text-ink-faint">No location yet</p>}
                      {c.contents && (
                        <p className="mt-2 text-[15px] text-ink-soft">
                          <span className="font-semibold text-ink">Contents: </span>
                          <Highlight text={c.contents} terms={ts} />
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : data.locations.length === 0 && data.containers.length === 0 ? (
        <div className="mt-4">
          <Empty icon={<Archive size={26} />} title="Nothing put away yet"
            body="Log a box or drawer once, and find it here in seconds."
            action={<Button onClick={() => nav.go('putaway')}>Put something away</Button>} />
        </div>
      ) : (
        <Browse />
      )}
    </div>
  );
}

function Browse() {
  const data = useData();
  const nav = useNav();
  const unplaced = data.containers.filter((c) => !c.locationId);
  return (
    <>
      <SectionTitle>Your places</SectionTitle>
      <ul className="space-y-2.5">
        {sortRecent(data.locations).map((l) => {
          const boxes = sortRecent(data.containers.filter((c) => c.locationId === l.id));
          const loose = data.items.filter((i) => !i.containerId && i.locationId === l.id).length;
          return (
            <li key={l.id} className="rounded-3xl bg-white ring-1 ring-sand-200">
              <button onClick={() => nav.open({ kind: 'location', id: l.id })}
                className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left">
                <MapPin size={20} className="text-sage-600" />
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold">{l.name}</span>
                  <span className="block text-sm text-ink-faint">
                    {boxes.length} box{boxes.length === 1 ? '' : 'es'}{loose ? ` · ${loose} item${loose === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
                <ChevronRight size={20} className="text-ink-faint" />
              </button>
              {boxes.length > 0 && (
                <ul className="border-t border-sand-100 px-2 pb-2">
                  {boxes.map((c) => (
                    <li key={c.id}>
                      <button onClick={() => nav.open({ kind: 'container', id: c.id })}
                        className="w-full rounded-2xl px-3 py-2.5 text-left active:bg-sand-100">
                        <span className="font-medium">{c.name}</span>
                        {c.spot && <span className="text-ink-faint"> · {c.spot}</span>}
                        {c.contents && <span className="block truncate text-sm text-ink-soft">{c.contents}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {unplaced.length > 0 && (
        <>
          <SectionTitle>Boxes without a place</SectionTitle>
          <ul className="space-y-2">
            {unplaced.map((c) => (
              <li key={c.id}>
                <button onClick={() => nav.open({ kind: 'container', id: c.id })}
                  className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-sand-200">
                  <span className="font-semibold">{c.name}</span>
                  {c.contents && <span className="block truncate text-sm text-ink-soft">{c.contents}</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
