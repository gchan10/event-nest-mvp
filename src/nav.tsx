import { createContext, useContext } from 'react';
import type { ItemInput } from './store';

export type Tab = 'home' | 'checklist' | 'stuff' | 'putaway' | 'find';

export type SheetState =
  | { kind: 'item'; id?: string; preset?: Partial<ItemInput> }
  | { kind: 'status'; id: string }
  | { kind: 'container'; id: string }
  | { kind: 'location'; id: string }
  | { kind: 'settings' }
  | null;

export interface Nav {
  tab: Tab;
  go: (tab: Tab) => void;
  open: (s: SheetState) => void;
  close: () => void;
  toast: (msg: string) => void;
}

export const NavCtx = createContext<Nav | null>(null);
export const useNav = () => useContext(NavCtx)!;
