import { useState } from 'react';
import { Button, Chip, Field, inputCls } from '../components/ui';
import { useStore } from '../store';
import { BabyProfile } from '../types';

export function ProfileFields({ value, onChange }: { value: BabyProfile; onChange: (p: BabyProfile) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Baby's name" hint="optional">
        <input
          className={inputCls} value={value.name} placeholder="e.g. Mia" autoComplete="off"
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </Field>
      <div>
        <div className="mb-2 flex gap-2">
          <Chip active={value.dateType === 'due'} onClick={() => onChange({ ...value, dateType: 'due' })}>Expecting</Chip>
          <Chip active={value.dateType === 'birth'} onClick={() => onChange({ ...value, dateType: 'birth' })}>Baby's here</Chip>
        </div>
        <Field label={value.dateType === 'due' ? 'Due date' : 'Birth date'}>
          <input
            type="date" className={inputCls} value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { completeOnboarding, enterDemo } = useStore();
  const [p, setP] = useState<BabyProfile>({ name: '', dateType: 'due', date: '' });

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-6 pb-safe pt-safe">
      <div className="pt-14">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-sage-500 shadow-sm">
          <svg viewBox="0 0 64 64" className="h-10 w-10"><path d="M14 30 32 16l18 14v18a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z" fill="#FAF7F2" /><circle cx="32" cy="36" r="6" fill="#728F78" /></svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">NestKit</h1>
        <p className="mt-1 text-xl text-ink-soft">Baby Gear, Sorted.</p>
        <p className="mt-6 text-ink-soft">Know what you need, what you have, and where you put it.</p>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-sand-200">
        <ProfileFields value={p} onChange={setP} />
      </div>

      <div className="mt-auto space-y-2 pb-6 pt-8">
        <Button className="w-full" onClick={() => completeOnboarding(p)}>Start my checklist</Button>
        <Button variant="ghost" className="w-full" onClick={enterDemo}>Skip — explore a demo household</Button>
        <p className="pt-2 text-center text-xs text-ink-faint">Saved privately in this browser. Nothing is uploaded.</p>
      </div>
    </div>
  );
}
