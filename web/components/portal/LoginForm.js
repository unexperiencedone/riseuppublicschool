'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '@/lib/auth';
import { SCHOOL } from '@/lib/config';

export default function LoginForm({ redirectTo = '/portal', title = 'Parent & Student Portal', subtitle = 'Sign in to see attendance, results, homework and fee status.' }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setStatus('submitting');
    try {
      const data = await login(form.email.trim().toLowerCase(), form.password);
      if (data.user.mustChangePassword) router.push('/portal/change-password');
      else router.push(redirectTo);
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-7 sm:p-8">
        <div className="text-center">
          <Image src="/images/brand/logo.png" alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />
          <h1 className="mt-4 font-display text-xl font-bold">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
        </div>

        {error && (
          <div role="alert" className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden /><p>{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input id="email" type="email" required autoComplete="email" className="input"
              value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} required autoComplete="current-password"
                className="input pr-11" value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-400 hover:text-slate-700">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
            {status === 'submitting'
              ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Signing in…</>
              : <><LogIn className="h-4 w-4" aria-hidden /> Sign in</>}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Forgotten your password, or not received login details? Call the school office on{' '}
          <a href={`tel:+91${SCHOOL.phone}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.phoneDisplay}</a>.
        </p>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-slate-500 hover:text-brand-700">← Back to the website</Link>
      </p>
    </div>
  );
}
