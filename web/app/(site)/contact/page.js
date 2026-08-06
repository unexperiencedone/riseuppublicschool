import { Phone, Mail, MapPin, Clock, User } from 'lucide-react';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import ContactForm from '@/components/forms/ContactForm';

export const metadata = buildMetadata({
  title: 'Contact Us',
  description: `Contact ${SCHOOL.name}, Pipargaon Aurai, Sant Ravidas Nagar Bhadohi, Uttar Pradesh 221301. Phone ${SCHOOL.phoneDisplay}, email ${SCHOOL.email}.`,
  path: '/contact',
});

const CONTACTS = [
  { Icon: MapPin, label: 'Address', value: SCHOOL.address.full },
  { Icon: Phone, label: 'School office', value: SCHOOL.phoneDisplay, href: `tel:+91${SCHOOL.phone}` },
  { Icon: Mail, label: 'Email', value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
  { Icon: Clock, label: 'Office hours', value: SCHOOL.officeHours },
];

const PEOPLE = [
  { ...SCHOOL.leadership.principal, note: 'Academics, examinations, student welfare' },
  { ...SCHOOL.leadership.manager, note: 'Admissions, transport, campus administration' },
];

const mapQuery = encodeURIComponent('Rise UP Public School, Pipargaon, Aurai, Bhadohi, Uttar Pradesh 221301');

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact the school"
        subtitle="Call, write or simply visit — the office is open six days a week."
        breadcrumb={[{ label: 'Contact' }]} />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading align="left" eyebrow="Reach us" title="School office" />
            <ul className="mt-8 space-y-4">
              {CONTACTS.map(({ Icon, label, value, href }) => (
                <li key={label} className="card flex gap-4 p-5">
                  <span className="shrink-0 rounded-lg bg-brand-50 p-3 text-brand-600" aria-hidden><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    {href
                      ? <a href={href} className="mt-0.5 block break-words font-semibold text-navy-800 hover:text-brand-700">{value}</a>
                      : <p className="mt-0.5 font-semibold text-navy-800">{value}</p>}
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-lg font-bold">Who to speak to</h2>
            <ul className="mt-4 space-y-3">
              {PEOPLE.map((p) => (
                <li key={p.name} className="card flex gap-4 p-5">
                  <span className="shrink-0 rounded-full bg-navy-600 p-3 text-white" aria-hidden><User className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-800">{p.name}</p>
                    <p className="text-xs font-semibold text-brand-600">{p.role}</p>
                    <p className="mt-1 text-sm text-slate-600">{p.note}</p>
                    {p.phone && <a href={`tel:+91${p.phone}`} className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:underline">+91 {p.phone}</a>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7"><ContactForm /></div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <SectionHeading align="left" eyebrow="Find us" title="Location" description="Pipargaon village, Aurai block, Sant Ravidas Nagar (Bhadohi) district, Uttar Pradesh." />
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
            <iframe
              title={`Map showing the location of ${SCHOOL.name}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-[420px] w-full border-0" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" allowFullScreen
            />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Replace this embed with the school&apos;s exact Google Business Profile map link once it is verified.
          </p>
        </div>
      </section>
    </>
  );
}
