'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { authedFetch, readSession, clearSession } from '@/lib/auth';

function loginPathFor(redirectTo) {
  return redirectTo.startsWith('/admin') ? '/admin/login' : '/portal/login';
}

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/portal';

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | done

  useEffect(() => {
    if (!readSession()?.token) router.replace(loginPathFor(redirectTo));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to run once, on mount
  }, []);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      e.newPassword = 'At least 8 characters, with a letter and a number';
    }
    if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setStatus('submitting');
    try {
      await authedFetch('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      // The API revokes every refresh token on a password change (including this
      // session's), so the cleanest next step is a fresh sign-in, not trying to
      // keep using the now-partially-invalid session.
      clearSession();
      setStatus('done');
    } catch (err) {
      setServerError(err.message || 'Could not change your password. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="card p-8 text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50" aria-hidden>
          <CheckCircle2 className="h-7 w-7 text-brand-600" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">Password changed</h1>
        <p className="mt-2 text-sm text-slate-600">Please sign in again with your new password.</p>
        <Link href={loginPathFor(redirectTo)} className="btn-primary mt-6 inline-flex">Continue to sign in</Link>
      </div>
    );
  }

  return (
    <div className="card p-7 sm:p-8">
      <h1 className="font-display text-xl font-bold">Set a new password</h1>
      <p className="mt-1.5 text-sm text-slate-600">
        This account was created with a temporary password. Choose a new one to continue.
      </p>

      {serverError && (
        <div role="alert" className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden /><p>{serverError}</p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="currentPassword">Current (temporary) password</label>
          <input
            id="currentPassword" type="password" autoComplete="current-password"
            className={`input ${errors.currentPassword ? 'input-error' : ''}`}
            value={form.currentPassword} onChange={set('currentPassword')}
            aria-invalid={errors.currentPassword ? 'true' : undefined}
          />
          {errors.currentPassword && <p className="help-error">{errors.currentPassword}</p>}
        </div>
        <div>
          <label className="label" htmlFor="newPassword">New password</label>
          <input
            id="newPassword" type="password" autoComplete="new-password"
            className={`input ${errors.newPassword ? 'input-error' : ''}`}
            value={form.newPassword} onChange={set('newPassword')}
            aria-invalid={errors.newPassword ? 'true' : undefined}
          />
          {errors.newPassword && <p className="help-error">{errors.newPassword}</p>}
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword" type="password" autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            value={form.confirmPassword} onChange={set('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
          />
          {errors.confirmPassword && <p className="help-error">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
          {status === 'submitting' ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…</>) : 'Save new password'}
        </button>
      </form>
    </div>
  );
}

export default function ChangePasswordForm() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Suspense fallback={<div className="card p-8 text-center text-sm text-slate-500">Loading…</div>}>
        <Form />
      </Suspense>
    </div>
  );
}
