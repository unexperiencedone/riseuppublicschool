'use client';

import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function PageHeader({ title, description, action }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-navy-800">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export const Body = ({ children }) => (
  <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
);

export function Loading({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label={label}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-outline !border-red-300 !text-red-700 !px-3 !py-1.5 !text-xs">Retry</button>}
    </div>
  );
}

export function Empty({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full bg-slate-100 p-4" aria-hidden><Inbox className="h-6 w-6 text-slate-400" /></span>
      <h3 className="font-display text-base font-bold text-navy-800">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

export function Toast({ message, tone = 'success', onClose }) {
  if (!message) return null;
  const tones = {
    success: 'border-brand-200 bg-brand-50 text-brand-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  };
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${tones[tone]}`}>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

export function ConfirmButton({ onConfirm, children, className = '', confirmLabel = 'Click again to confirm' }) {
  return <ConfirmInner onConfirm={onConfirm} className={className} confirmLabel={confirmLabel}>{children}</ConfirmInner>;
}

import { useState } from 'react';
function ConfirmInner({ onConfirm, children, className, confirmLabel }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { if (armed) { onConfirm(); setArmed(false); } else { setArmed(true); setTimeout(() => setArmed(false), 4000); } }}
      className={armed ? `${className} !bg-red-600 !text-white` : className}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
