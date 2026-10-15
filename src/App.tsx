import { Archive, House, Package, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from './components/ui';
import { NavCtx, SheetState, Tab } from './nav';
import Checklist from './screens/Checklist';
import Find from './screens/Find';
import Home from './screens/Home';
import MyStuff from './screens/MyStuff';
import Onboarding from './screens/Onboarding';
import PutAway from './screens/PutAway';
import { ContainerSheet, LocationSheet } from './sheets/PlaceSheets';
import ItemSheet from './sheets/ItemSheet';
import SettingsSheet from './sheets/SettingsSheet';
import StatusSheet from './sheets/StatusSheet';
import { useStore } from './store';

const TABS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'stuff', label: 'My Stuff', icon: Package },
  { id: 'putaway', label: 'Put Away', icon: Archive },
  { id: 'find', label: 'Find', icon: Search },
];

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef<number>();

  const go = useCallback((t: Tab) => { setSheet(null); setTab(t); window.scrollTo(0, 0); }, []);
  const close = useCallback(() => setSheet(null), []);
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(''), 2600);
  }, []);

  // After onboarding, land on the checklist.
  const wasOnboarding = useRef(!store.data);
  useEffect(() => {
    if (store.data && wasOnboarding.current) {
      wasOnboarding.current = false;
      setTab(store.mode === 'user' && store.data.items.length === 0 ? 'checklist' : 'home');
    }
    if (!store.data) wasOnboarding.current = true;
  }, [store.data, store.mode]);

  if (!store.data) return <Onboarding />;

  const nav = { tab, go, open: setSheet, close, toast };
  const activeTab = tab === 'checklist' ? 'home' : tab;

  return (
    <NavCtx.Provider value={nav}>
      <div className="mx-auto min-h-[100dvh] max-w-lg pb-28 pt-safe">
        {store.mode === 'demo' && (
          <div className="flex items-center justify-between gap-3 bg-sage-700 px-4 py-2 text-sm text-white">
            <span>Demo household — explore freely.</span>
            <button className="min-h-[36px] rounded-full bg-white/15 px-3 font-semibold" onClick={store.exitDemo}>
              Use my own
            </button>
          </div>
        )}
        {tab === 'home' && <Home />}
        {tab === 'checklist' && <Checklist />}
        {tab === 'stuff' && <MyStuff />}
        {tab === 'putaway' && <PutAway />}
        {tab === 'find' && <Find />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-cream/95 backdrop-blur pb-safe">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={cx(
                'flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs font-semibold',
                activeTab === id ? 'text-sage-700' : 'text-ink-faint',
              )}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <span className={cx('grid h-8 w-14 place-items-center rounded-full', activeTab === id && 'bg-sage-100')}>
                <Icon size={22} strokeWidth={activeTab === id ? 2.4 : 2} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="rounded-2xl bg-ink px-4 py-3 text-[15px] font-medium text-white shadow-lg">{toastMsg}</div>
        </div>
      )}

      {sheet?.kind === 'item' && <ItemSheet id={sheet.id} preset={sheet.preset} />}
      {sheet?.kind === 'status' && <StatusSheet id={sheet.id} />}
      {sheet?.kind === 'container' && <ContainerSheet id={sheet.id} />}
      {sheet?.kind === 'location' && <LocationSheet id={sheet.id} />}
      {sheet?.kind === 'settings' && <SettingsSheet />}
    </NavCtx.Provider>
  );
}
