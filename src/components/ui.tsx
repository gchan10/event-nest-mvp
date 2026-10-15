import { X } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode, useEffect } from 'react';
import { Place, whereLabel } from '../lib/derive';
import { CATEGORY_BY_ID, STATUS_BY_ID } from '../lib/meta';
import { Category, Status } from '../types';
import { MapPin, Package } from 'lucide-react';

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

export function Sheet({ title, onClose, children, footer }: {
  title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-cream shadow-xl">
        <div className="flex items-center gap-2 px-5 pb-2 pt-4">
          <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-ink-soft active:bg-sand-200">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-sand-200 px-5 pb-safe pt-3">{footer}</div>}
      </div>
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' | 'danger' };
export function Button({ variant = 'primary', className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-colors disabled:opacity-40',
        variant === 'primary' && 'bg-sage-600 text-white active:bg-sage-700',
        variant === 'soft' && 'bg-sage-100 text-sage-800 active:bg-sage-200',
        variant === 'ghost' && 'text-ink-soft active:bg-sand-200',
        variant === 'danger' && 'text-red-700 active:bg-red-50',
        className,
      )}
    />
  );
}

export function Chip({ active, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-4 text-[15px] font-medium ring-1 transition-colors',
        active ? 'bg-sage-600 text-white ring-sage-600' : 'bg-white text-ink ring-sand-200 active:bg-sand-100',
        className,
      )}
    />
  );
}

export function StatusPill({ status, onClick }: { status: Status; onClick?: () => void }) {
  const s = STATUS_BY_ID[status];
  const cls = cx('inline-flex min-h-[32px] shrink-0 items-center rounded-full px-3 text-sm font-medium ring-1', s.tone);
  return onClick ? (
    <button type="button" className={cx(cls, 'min-h-[40px]')} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {s.label}
    </button>
  ) : <span className={cls}>{s.label}</span>;
}

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  const Icon = CATEGORY_BY_ID[category]?.icon ?? Package;
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand-100 text-sage-700">
      <Icon size={size} />
    </span>
  );
}

export function PlaceLine({ place, strong }: { place: Place; strong?: boolean }) {
  const where = whereLabel(place);
  if (!where && !place.container) return null;
  return (
    <div className={cx('flex items-start gap-1.5', strong ? 'text-[15px] font-medium text-sage-800' : 'text-sm text-ink-soft')}>
      <MapPin size={strong ? 17 : 15} className="mt-0.5 shrink-0 text-sage-600" />
      <span className="min-w-0">
        {place.container && <span className="font-semibold">{place.container.name}</span>}
        {place.container && where && ' · '}
        {where || (place.container ? <span className="text-ink-faint">no location yet</span> : null)}
      </span>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}{hint && <span className="font-normal text-ink-faint"> · {hint}</span>}
      </span>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full rounded-2xl border-0 bg-white px-4 py-3 text-base text-ink ring-1 ring-sand-200 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage-500';

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-7 flex items-center justify-between">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink-faint">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-sand-200">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-sage-100 text-sage-700">{icon}</div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-ink-soft">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length || !text) return <>{text}</>;
  const esc = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${esc.join('|')})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? <mark key={i} className="rounded-sm bg-amber-100 text-ink">{p}</mark> : <span key={i}>{p}</span>)}
    </>
  );
}
