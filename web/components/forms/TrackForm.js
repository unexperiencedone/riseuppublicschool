'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '@/lib/config';

const STATUS_LABEL = {
  new: { label: 'Received', tone: 'bg-blue-50 text-blue-700 ring-blue-200', text: 'We have your enquiry. Our admissions team will call you shortly.' },
  contacted: { label: 'Contacted', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200', text: 'Our team has spoken with you. Please visit the campus at your convenience.' },
  documents_pending: { label: 'Documents pending', tone: 'bg-amber-50 text-amber-800 ring-amber-200', text: 'We are waiting for the remaining documents. Please bring them to the school office.' },
  shortlisted: { label: 'Shortlisted', tone: 'bg-teal-50 text-teal-700 ring-teal-200', text: 'Your application has been shortlisted. The office will confirm the next step.' },
  admitted: { label: 'Admitted', tone: 'bg-brand-50 text-brand-700 ring-brand-200', text: 'Congratulations — admission confirmed. Please collect the admission letter from the office.' },
  rejected: { label: 'Not accepted', tone: 'bg-red-50 text-red-700 ring-red-200', text: 'Unfortunately we could not offer a seat this session. Please contact the office for details.' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700 ring-slate-200', text: 'This application has been withdrawn.' },
};

export default function TrackForm() {
  const [applicationNo, setApplicationNo] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ status: 'idle', data: null, error: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!applicationNo.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      setState({ status: 'error', data: null, error: 'Enter your application number and the mobile number used on the form.' });
      return;
    }
    setState({ status: 'loading', data: null, error: '' });
    try {
      const res = await fetch(`${API_URL}/admissions/track/${encodeURIComponent(applicationNo.trim())}?phone=${phone}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Application not found');
      setState({ status: 'success', data: json.data, error: '' });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message });
    }
  };

  const info = state.data ? STATUS_LABEL[state.data.status] || STATUS_LABEL.new : null;

  return (
    <div className="card p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold">Track your application</h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Enter the application number you received (for example <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RUPS/2026/00001</code>)
        along with the mobile number you used.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="appno">Application number</label>
          <input id="appno" className="input" value={applicationNo} onChange={(e) => setApplicationNo(e.target.value)} placeholder="RUPS/2026/00001" />
        </div>
        <div>
          <label className="label" htmlFor="trackphone">Mobile number</label>
          <input id="trackphone" className="input" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9170285353" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={state.status === 'loading'} className="btn-primary w-full sm:w-auto">
            {state.status === 'loading'
              ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking…</>
              : <><Search className="h-4 w-4" aria-hidden /> Check Status</>}
          </button>
        </div>
      </form>

      {state.status === 'error' && (
        <div role="alert" className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
          <p>{state.error} If the problem continues, call the school office on 9170285353.</p>
        </div>
      )}

      {state.status === 'success' && state.data && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-lg font-bold text-navy-800">{state.data.applicationNo}</p>
            <span className={`chip ${info.tone}`}>{info.label}</span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Student</dt><dd className="font-semibold text-navy-800">{state.data.student?.firstName}</dd></div>
            <div><dt className="text-slate-500">Class applied for</dt><dd className="font-semibold text-navy-800">{state.data.student?.classApplyingFor}</dd></div>
            <div><dt className="text-slate-500">Submitted on</dt><dd className="font-semibold text-navy-800">{new Date(state.data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
          </dl>
          <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">{info.text}</p>
        </div>
      )}
    </div>
  );
}
