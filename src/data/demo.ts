import { AppData, InventoryItem, SCHEMA_VERSION, Status } from '../types';
import { CATALOG_BY_ID } from './catalog';

/** A demo household with a ~3-month-old. Dates are relative to "now". */
export function makeDemo(now = new Date()): AppData {
  const t = now.getTime();
  const birth = new Date(t - 92 * 86400000).toISOString().slice(0, 10);

  const loc = (id: string, name: string, ago: number) => ({ id, name, lastUsedAt: t - ago });
  const locations = [
    loc('demo-loc-nursery', 'Nursery closet', 1000),
    loc('demo-loc-bedroom', 'Bedroom closet', 2000),
    loc('demo-loc-garage', 'Garage', 3000),
  ];
  const containers = [
    {
      id: 'demo-box-bin', name: 'Blue bin', locationId: 'demo-loc-bedroom', spot: 'Top shelf',
      contents: 'Newborn clothes, extra swaddles, newborn hats, mittens',
      createdAt: t, lastUsedAt: t - 500,
    },
    {
      id: 'demo-box-bottles', name: 'Drawer 2', locationId: 'demo-loc-nursery',
      contents: 'Spare bottle nipples, pacifiers, nail file',
      createdAt: t, lastUsedAt: t - 1500,
    },
  ];

  let n = 0;
  const item = (
    catalogId: string | undefined, status: Status, extra: Partial<InventoryItem> = {},
  ): InventoryItem => {
    const cat = catalogId ? CATALOG_BY_ID[catalogId] : undefined;
    return {
      id: `demo-item-${++n}`,
      name: cat?.name ?? 'Item',
      category: cat?.category ?? 'other',
      quantity: 1,
      status,
      catalogId,
      createdAt: t - n * 1000,
      updatedAt: t - n * 1000,
      ...extra,
    };
  };

  const items: InventoryItem[] = [
    item('crib', 'purchased', { name: 'Crib', brand: 'Babyletto' }),
    item('crib-mattress', 'purchased'),
    item('crib-sheets', 'gifted', { quantity: 3 }),
    item('swaddles', 'gifted', { name: 'Muslin swaddles', quantity: 4, containerId: 'demo-box-bin' }),
    item('burp-cloths', 'purchased', { quantity: 8, locationId: 'demo-loc-nursery' }),
    item('bottles', 'purchased', { quantity: 4, size: 'Slow flow' }),
    item('diapers', 'purchased', { name: 'Diapers', brand: 'Coterie', size: 'Size 1', notes: 'Fits best, no leaks overnight', locationId: 'demo-loc-nursery', spot: 'Bottom shelf' }),
    item('diapers', 'purchased', { name: 'Diapers', brand: 'Pampers Swaddlers', size: 'Size 2', notes: 'Leak at night — use up for daytime', locationId: 'demo-loc-nursery', spot: 'Bottom shelf' }),
    item('wipes', 'purchased', { brand: 'WaterWipes', quantity: 6 }),
    item('car-seat', 'purchased', { brand: 'Nuna Pipa' }),
    item('stroller', 'handmedown', { notes: 'From cousin Ana', locationId: 'demo-loc-garage' }),
    item('bathtub', 'borrowed', { notes: 'Return to the Parks after 6 months' }),
    item('play-mat', 'borrowed', { name: 'Play gym', notes: 'From neighbor Sam' }),
    item('bodysuits', 'gifted', { quantity: 10, size: '0–3m' }),
    item('sleepers', 'purchased', { quantity: 6, size: '0–3m' }),
    item('thermometer', 'purchased'),
    item('baby-wash', 'purchased', { notes: 'Fragrance-free only' }),
    item('high-chair', 'registry'),
    item('carrier', 'registry'),
    item('bibs', 'registry'),
    item('convertible-seat', 'canborrow', { notes: 'Sister has one we can use' }),
    item('clothes-3-6', 'need'),
    item('teethers', 'need'),
    item('diaper-pail', 'skipped'),
    item(undefined, 'gifted', { name: 'Handmade quilt', category: 'other', notes: 'Keepsake — not for sleep', containerId: 'demo-box-bin' }),
  ];

  return {
    version: SCHEMA_VERSION,
    profile: { name: 'Mia', dateType: 'birth', date: birth },
    items, locations, containers,
    preferences: [
      { id: 'demo-pref-1', text: 'Prefer Coterie diapers — Pampers leak overnight' },
      { id: 'demo-pref-2', text: 'Fragrance-free products only' },
    ],
  };
}
