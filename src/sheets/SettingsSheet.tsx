import { Download, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, SectionTitle, Sheet, inputCls } from '../components/ui';
import { useNav } from '../nav';
import { ProfileFields } from '../screens/Onboarding';
import { useData, useStore } from '../store';

export default function SettingsSheet() {
  const data = useData();
  const store = useStore();
  const nav = useNav();
  const [pref, setPref] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ app: 'nestkit', exportedAt: new Date().toISOString(), ...data }, null, 2)],
      { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nestkit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const importJson = async (f: File) => {
    try {
      const raw = JSON.parse(await f.text());
      if (!confirm('Replace your saved NestKit data with this backup?')) return;
      if (store.importData(raw)) { nav.toast('Backup restored'); nav.close(); }
      else alert("That file doesn't look like a NestKit backup.");
    } catch {
      alert("Couldn't read that file.");
    }
  };

  return (
    <Sheet title="Settings" onClose={nav.close}>
      <SectionTitle>Baby</SectionTitle>
      <div className="rounded-3xl bg-white p-4 ring-1 ring-sand-200">
        <ProfileFields value={data.profile} onChange={store.setProfile} />
      </div>

      <SectionTitle>Preferences & notes</SectionTitle>
      <ul className="space-y-2">
        {data.preferences.map((p) => (
          <li key={p.id} className="flex items-center gap-2 rounded-2xl bg-white py-1 pl-4 pr-1 ring-1 ring-sand-200">
            <span className="flex-1 py-2">{p.text}</span>
            <button aria-label="Remove" onClick={() => store.removePreference(p.id)}
              className="grid h-11 w-11 place-items-center text-ink-faint"><X size={18} /></button>
          </li>
        ))}
      </ul>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); store.addPreference(pref); setPref(''); }}>
        <input className={inputCls} value={pref} onChange={(e) => setPref(e.target.value)} placeholder="e.g. Prefer fragrance-free" />
        <Button type="submit" variant="soft" disabled={!pref.trim()}>Add</Button>
      </form>

      <SectionTitle>Your data</SectionTitle>
      <p className="mb-3 text-sm text-ink-soft">
        NestKit saves only in this browser on this device. It is not synced or backed up — export a copy now and then.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={exportJson}><Download size={18} /> Export</Button>
        <Button variant="soft" onClick={() => file.current?.click()}><Upload size={18} /> Import</Button>
      </div>
      <input ref={file} type="file" accept="application/json,.json" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />

      <SectionTitle>{store.mode === 'demo' ? 'Demo' : 'Explore'}</SectionTitle>
      {store.mode === 'demo' ? (
        <div className="space-y-2">
          <Button variant="soft" className="w-full" onClick={() => { store.resetDemo(); nav.toast('Demo reset'); nav.close(); }}>
            <RotateCcw size={18} /> Reset demo data
          </Button>
          <Button className="w-full" onClick={() => { nav.close(); store.exitDemo(); }}>Switch to my own data</Button>
          <p className="text-center text-xs text-ink-faint">Demo data is kept separate — resetting it never touches yours.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Button variant="soft" className="w-full" onClick={() => { nav.close(); store.enterDemo(); }}>Try the demo household</Button>
          <Button variant="danger" className="w-full" onClick={() => {
            if (confirm('Erase all of your NestKit data on this device? Export first if you want a copy.')) store.eraseMyData();
          }}><Trash2 size={18} /> Erase my data</Button>
        </div>
      )}
      <p className="pb-4 pt-8 text-center text-xs text-ink-faint">NestKit · Baby Gear, Sorted.</p>
    </Sheet>
  );
}
