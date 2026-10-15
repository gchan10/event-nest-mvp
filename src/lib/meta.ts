import {
  Baby, Bath, Car, HeartPulse, LucideIcon, Milk, Moon, Package, Puzzle, Shirt,
} from 'lucide-react';
import { Category, ChecklistDecision, Priority, Status } from '../types';

export const CATEGORIES: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'feeding', label: 'Feeding', icon: Milk },
  { id: 'diapering', label: 'Diapering', icon: Baby },
  { id: 'clothing', label: 'Clothing', icon: Shirt },
  { id: 'bathing', label: 'Bathing', icon: Bath },
  { id: 'travel', label: 'Travel', icon: Car },
  { id: 'health', label: 'Health & Safety', icon: HeartPulse },
  { id: 'play', label: 'Play', icon: Puzzle },
  { id: 'other', label: 'Other', icon: Package },
];
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  Category, (typeof CATEGORIES)[number]
>;

export const STATUSES: { id: Status; label: string; tone: string }[] = [
  { id: 'need', label: 'Need', tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  { id: 'registry', label: 'On registry', tone: 'bg-sky-50 text-sky-800 ring-sky-200' },
  { id: 'purchased', label: 'Purchased', tone: 'bg-sage-100 text-sage-800 ring-sage-200' },
  { id: 'gifted', label: 'Gifted', tone: 'bg-sage-100 text-sage-800 ring-sage-200' },
  { id: 'handmedown', label: 'Hand-me-down', tone: 'bg-sage-100 text-sage-800 ring-sage-200' },
  { id: 'borrowed', label: 'Borrowed', tone: 'bg-sage-100 text-sage-800 ring-sage-200' },
  { id: 'canborrow', label: 'Can borrow', tone: 'bg-violet-50 text-violet-800 ring-violet-200' },
  { id: 'skipped', label: 'Skipped', tone: 'bg-sand-100 text-ink-faint ring-sand-200' },
];
export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
  Status, (typeof STATUSES)[number]
>;

/** Owned, received or borrowed = covered. Registry / can-borrow are not (yet). */
export const COVERED: Status[] = ['purchased', 'gifted', 'handmedown', 'borrowed'];
export const isCovered = (s: Status) => COVERED.includes(s);

export const PRIORITY_LABEL: Record<Priority, string> = {
  essential: 'Essential', useful: 'Useful', optional: 'Optional',
};
export const PRIORITY_TONE: Record<Priority, string> = {
  essential: 'text-sage-700 bg-sage-100',
  useful: 'text-ink-soft bg-sand-100',
  optional: 'text-ink-faint bg-sand-100',
};

export const DECISIONS: { id: ChecklistDecision; label: string; status: Status }[] = [
  { id: 'have', label: 'Have it', status: 'purchased' },
  { id: 'registry', label: 'Registry', status: 'registry' },
  { id: 'borrow', label: 'Can borrow', status: 'canborrow' },
  { id: 'need', label: 'Need', status: 'need' },
  { id: 'skip', label: 'Skip', status: 'skipped' },
];

export const LOCATION_SUGGESTIONS = [
  'Nursery closet', 'Bedroom closet', 'Under crib', 'Dresser', 'Basement', 'Garage', 'Storage unit',
];
