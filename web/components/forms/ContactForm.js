'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';

const CATEGORIES = [
  { value: 'admission', label: 'Admission' },
  { value: 'academic', label: 'Academics' },
  { value: 'transport', label: 'Transport' },
  { value: 'fee', label: 'Fees' },
  { value: 'career', label: 'Career / Vacancy' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'general', label: 'General' },
];

const initial = { name: '', email: '', phone: '', category: 'general', subject: '', message: '', website: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) e.message = 'Please write at least 10 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setStatus('submitting');
    try {
      await apiPost('/contact', {
        name: form.name.trim(), email: form.email || '', phone: form.phone,
        category: form.category, subject: form.subject || 'General enquiry',
        message: form.message.trim(), website: form.website,
      });
      setStatus('success');
    } catch (err) {
      setServerError(err.message || 'Could not send your message. Please call 9170285353.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50" aria-hidden>
          <CheckCircle2 className="h-7 w-7 text-brand-600" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold">Message sent</h3>
        <p className="mt-2 text-sm text-slate-600">Thank you for writing to us. We respond to every message within two working days.</p>
        <button type="button" onClick={() => { setForm(initial); setStatus('idle'); }} className="btn-outline mt-6">
          Send another message
        </button>
      </div>
    );
  }

  const field = (name) => ({
    id: `c-${name}`, name, value: form[name], onChange: set(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `c-${name}-error` : undefined,
    className: `input ${errors[name] ? 'input-error' : ''}`,
  });
  const Err = ({ name }) => errors[name] ? <p id={`c-${name}-error`} className="help-error">{errors[name]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold">Send us a message</h2>
      <p className="mt-1.5 text-sm text-slate-600">We reply to every message within two working days.</p>

      {serverError && (
        <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden /><p>{serverError}</p>
        </div>
      )}

      <div className="hidden" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Your name <span className="text-red-600">*</span></label>
          <input {...field('name')} type="text" autoComplete="name" />
          <Err name="name" />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">Mobile number <span className="text-red-600">*</span></label>
          <input {...field('phone')} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel" />
          <Err name="phone" />
        </div>
        <div>
          <label className="label" htmlFor="c-email">Email</label>
          <input {...field('email')} type="email" autoComplete="email" />
          <Err name="email" />
        </div>
        <div>
          <label className="label" htmlFor="c-category">What is this about?</label>
          <select {...field('category')}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-subject">Subject</label>
          <input {...field('subject')} type="text" placeholder="Short summary" maxLength={160} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-message">Message <span className="text-red-600">*</span></label>
          <textarea {...field('message')} rows={5} maxLength={2000} />
          <Err name="message" />
        </div>
      </div>

      <button type="submit" disabled={status === 'submitting'} className="btn-primary mt-6 w-full sm:w-auto">
        {status === 'submitting' ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…</>) : 'Send Message'}
      </button>
    </form>
  );
}
