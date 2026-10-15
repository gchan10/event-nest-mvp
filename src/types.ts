// Core data models. IDs are stable strings so these map 1:1 to future DB tables.

export type Category =
  | 'sleep' | 'feeding' | 'diapering' | 'clothing' | 'bathing'
  | 'travel' | 'health' | 'play' | 'other';

export type Status =
  | 'need' | 'registry' | 'purchased' | 'gifted' | 'handmedown'
  | 'borrowed' | 'canborrow' | 'skipped';

export type Priority = 'essential' | 'useful' | 'optional';

export interface BabyProfile {
  name: string;
  dateType: 'due' | 'birth';
  date: string; // YYYY-MM-DD, or '' if unknown
}

/** Curated, read-only reference list ("What do I need?"). */
export interface CatalogItem {
  id: string;
  name: string;
  category: Category;
  priority: Priority;
  startMonth: number; // approx. age (months) when this becomes relevant
  ageLabel: string;
  why: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  brand?: string;
  quantity: number;
  size?: string;
  status: Status;
  catalogId?: string; // links to a checklist entry; several items may share one
  // Placement: if containerId is set, the container decides where it is.
  containerId?: string;
  locationId?: string;
  spot?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StorageLocation {
  id: string;
  name: string;
  lastUsedAt: number;
}

export interface StorageContainer {
  id: string;
  name: string;
  locationId?: string;
  spot?: string; // optional sub-location, e.g. "Top shelf"
  contents: string; // free-text description, searchable
  createdAt: number;
  lastUsedAt: number;
}

/**
 * Checklist decisions are NOT stored separately: they are derived from the
 * inventory items linked to a catalog entry (see lib/derive.ts). One source of truth.
 */
export type ChecklistDecision = 'have' | 'registry' | 'borrow' | 'need' | 'skip';

export interface Preference {
  id: string;
  text: string;
}

export const SCHEMA_VERSION = 1;

export interface AppData {
  version: typeof SCHEMA_VERSION;
  profile: BabyProfile;
  items: InventoryItem[];
  locations: StorageLocation[];
  containers: StorageContainer[];
  preferences: Preference[];
}

export type Mode = 'user' | 'demo';
