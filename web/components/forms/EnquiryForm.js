'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Copy } from 'lucide-react';
import { apiPost } from '@/lib/api';

const CLASS_LEVELS = ['Play Group','Nursery','LKG','UKG','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const PRE_PRIMARY = ['Play Group', 'Nursery', 'LKG', 'UKG'];
const STREAM_CLASSES = ['XI', 'XII'];

const initial = {
  firstName: '', lastName: '', classApplyingFor: '', stream: 'NA', gender: '', dob: '',
  previousSchool: '', guardianName: '', relation: 'Father', phone: '', altPhone: '',
  email: '', village: '', pincode: '', message: '', consent: false, website: '',
};

export default function EnquiryForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [applicationNo, setApplicationNo] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.firstName.trim().length < 2) e.firstName = "Please enter the student's name";
    if (!form.classApplyingFor) e.classApplyingFor = 'Select the class you are applying for';
    if (form.guardianName.trim().length < 2) e.guardianName = "Please enter the parent's or guardian's name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (form.altPhone && !/^[6-9]\d{9}$/.test(form.altPhone)) e.altPhone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'PIN code must be 6 digits';
    if (!form.consent) e.consent = 'Please accept the privacy consent to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setStatus('submitting');
    try {
      const res = await apiPost('/admissions/enquiry', {
        student: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          dob: form.dob || undefined,
          gender: form.gender || undefined,
          classApplyingFor: form.classApplyingFor,
          stream: STREAM_CLASSES.includes(form.classApplyingFor) ? form.stream : 'NA',
          previousSchool: form.previousSchool || undefined,
        },
        parent: {
          guardianName: form.guardianName.trim(),
          relation: form.relation,
          phone: form.phone,
          altPhone: form.altPhone || undefined,
          email: form.email || '',
        },
        address: { village: form.village || undefined, pincode: form.pincode || undefined, state: 'Uttar Pradesh' },
        message: form.message || undefined,
        consent: true,
        website: form.website,
      });
      setApplicationNo(res?.data?.applicationNo || '');
      setStatus('success');
    } catch (err) {
      if (err.errors?.length) {
        const mapped = {};
        err.errors.forEach((i) => { mapped[i.path.split('.').pop()] = i.message; });
        setErrors(mapped);
      }
      setServerError(err.message || 'Something went wrong. Please call 9170285353 instead.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50" aria-hidden>
          <CheckCircle2 className="h-7 w-7 text-brand-600" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold">Enquiry received</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you. Our admissions team will call you on <strong>{form.phone}</strong> within two working days.
        </p>
        {applicationNo && (
          <div className="mx-auto mt-5 max-w-xs rounded-lg bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Your application number</p>
            <p className="mt-1 font-display text-lg font-bold text-navy-800">{applicationNo}</p>
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(applicationNo); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden /> {copied ? 'Copied' : 'Copy number'}
            </button>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">Keep this number handy — you can use it to track your application.</p>
        <button type="button" onClick={() => { setForm(initial); setStatus('idle'); }} className="btn-outline mt-6">
          Submit another enquiry
        </button>
      </div>
    );
  }

  const field = (name) => ({
    id: name, name, value: form[name], onChange: set(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: `input ${errors[name] ? 'input-error' : ''}`,
  });
  const Err = ({ name }) => errors[name] ? <p id={`${name}-error`} className="help-error">{errors[name]}</p> : null;
  const classLabel = (c) => (PRE_PRIMARY.includes(c) ? c : `Class ${c}`);

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
      <p className="eyebrow">Admission Enquiry</p>
      <h2 className="mt-1 font-display text-2xl font-bold">Tell us about your child</h2>
      <p className="mt-2 text-sm text-slate-600">
        Fields marked <span className="text-red-600">*</span> are required. We will never share your details with anyone else.
      </p>

      {serverError && (
        <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
          <p>{serverError}</p>
        </div>
      )}

      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      <fieldset className="mt-7">
        <legend className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-600">Student details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="firstName">Student&apos;s first name <span className="text-red-600">*</span></label>
            <input {...field('firstName')} type="text" autoComplete="given-name" placeholder="Aarav" />
            <Err name="firstName" />
          </div>
          <div>
            <label className="label" htmlFor="lastName">Last name</label>
            <input {...field('lastName')} type="text" autoComplete="family-name" placeholder="Dubey" />
          </div>
          <div>
            <label className="label" htmlFor="classApplyingFor">Class applying for <span className="text-red-600">*</span></label>
            <select {...field('classApplyingFor')}>
              <option value="">Select a class</option>
              {CLASS_LEVELS.map((c) => <option key={c} value={c}>{classLabel(c)}</option>)}
            </select>
            <Err name="classApplyingFor" />
          </div>
          {STREAM_CLASSES.includes(form.classApplyingFor) && (
            <div>
              <label className="label" htmlFor="stream">Preferred stream</label>
              <select {...field('stream')}>
                <option value="NA">Not decided</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
          )}
          <div>
            <label className="label" htmlFor="dob">Date of birth</label>
            <input {...field('dob')} type="date" max={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select {...field('gender')}>
              <option value="">Prefer not to say</option>
              <option value="male">Boy</option>
              <option value="female">Girl</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="previousSchool">Previous school (if any)</label>
            <input {...field('previousSchool')} type="text" placeholder="Name of the school last attended" />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-600">Parent / Guardian details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="guardianName">Full name <span className="text-red-600">*</span></label>
            <input {...field('guardianName')} type="text" autoComplete="name" placeholder="Suresh Dubey" />
            <Err name="guardianName" />
          </div>
          <div>
            <label className="label" htmlFor="relation">Relation to student</label>
            <select {...field('relation')}>
              <option>Father</option><option>Mother</option><option>Guardian</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="phone">Mobile number <span className="text-red-600">*</span></label>
            <input {...field('phone')} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel" placeholder="9170285353" />
            <Err name="phone" />
          </div>
          <div>
            <label className="label" htmlFor="altPhone">Alternate mobile</label>
            <input {...field('altPhone')} type="tel" inputMode="numeric" maxLength={10} placeholder="Optional" />
            <Err name="altPhone" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input {...field('email')} type="email" autoComplete="email" placeholder="you@example.com" />
            <Err name="email" />
          </div>
          <div>
            <label className="label" htmlFor="village">Village / locality</label>
            <input {...field('village')} type="text" placeholder="Pipargaon" />
          </div>
          <div>
            <label className="label" htmlFor="pincode">PIN code</label>
            <input {...field('pincode')} type="text" inputMode="numeric" maxLength={6} placeholder="221301" />
            <Err name="pincode" />
          </div>
        </div>
      </fieldset>

      <div className="mt-6">
        <label className="label" htmlFor="message">Anything you would like us to know?</label>
        <textarea {...field('message')} rows={3} maxLength={1000} placeholder="Questions about transport, fees, or anything else." />
      </div>

      <div className="mt-6 flex gap-3 rounded-lg bg-slate-50 p-4">
        <input
          id="consent" name="consent" type="checkbox" checked={form.consent} onChange={set('consent')}
          aria-invalid={errors.consent ? 'true' : undefined}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <div>
          <label htmlFor="consent" className="text-sm text-slate-700">
            I consent to Rise UP Public School storing and using these details to contact me about admission.
            <span className="text-red-600"> *</span>
          </label>
          {errors.consent && <p id="consent-error" className="help-error">{errors.consent}</p>}
        </div>
      </div>

      <button type="submit" disabled={status === 'submitting'} className="btn-primary mt-6 w-full sm:w-auto">
        {status === 'submitting' ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting…</>) : 'Submit Enquiry'}
      </button>
      <p className="mt-3 text-xs text-slate-500">
        Prefer to talk? Call <a href="tel:+919170285353" className="font-semibold text-brand-700 hover:underline">+91 91702 85353</a> between 8 AM and 3 PM.
      </p>
    </form>
  );
}
