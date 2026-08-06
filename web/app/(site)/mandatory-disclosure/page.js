import Link from 'next/link';
import { FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;
export const metadata = buildMetadata({
  title: 'Mandatory Public Disclosure',
  description: `Mandatory public disclosure — general, academic, staff and infrastructure information for ${SCHOOL.name}, Pipargaon Aurai Bhadohi.`,
  path: '/mandatory-disclosure',
});

const GENERAL = [
  ['Name of the school', SCHOOL.name],
  ['Affiliation / Board', 'CBSE Pattern — affiliation status available at the school office'],
  ['Affiliation number', 'To be updated'],
  ['School code', 'To be updated'],
  ['UDISE code', 'To be updated'],
  ['Complete address', SCHOOL.address.full],
  ['Tehsil / Block', SCHOOL.address.tehsil],
  ['District', SCHOOL.address.district],
  ['State', SCHOOL.address.state],
  ['PIN code', SCHOOL.address.pincode],
  ['Principal', `${SCHOOL.leadership.principal.name} — ${SCHOOL.leadership.principal.qualifications}`],
  ['School email', SCHOOL.email],
  ['Contact number', SCHOOL.phoneDisplay],
  ['Name of the Trust / Society', SCHOOL.trust],
  ['Year of establishment', String(SCHOOL.established)],
];

const DOCUMENTS = [
  'Certificate of affiliation / upgradation, with the period of validity',
  'Trust / Society / Company registration certificate',
  'No Objection Certificate (NOC) issued by the State Government',
  'Recognition certificate under the RTE Act, 2009',
  'Building safety certificate',
  'Fire safety certificate issued by the competent authority',
  'Water, health and sanitation certificate',
  'Self-certification of Directorate Education Officer (DEO)',
  'Copies of the last three years’ audited financial statements',
];

const ACADEMIC = [
  ['Classes offered', SCHOOL.classesOffered],
  ['Medium of instruction', 'English'],
  ['Academic session', 'April to March'],
  ['Current session', SCHOOL.session],
  ['Academic calendar', 'Published on this website and available as a PDF download'],
  ['Fee structure', 'Published on this website — see the Fee Structure page'],
  ['Assessment pattern', '4 unit tests, half-yearly and annual examinations; 4 PTMs per session'],
  ['Board examination results', 'To be published as each cohort completes the board examinations'],
];

const INFRA = [
  ['Total campus area', 'To be updated'],
  ['Built-up area', 'To be updated'],
  ['Number of classrooms', 'To be updated'],
  ['Science laboratories', 'Available'],
  ['Computer laboratory', 'Available'],
  ['Library', 'Available'],
  ['Playground', 'Available'],
  ['Drinking water', 'Filtered drinking water points on every floor'],
  ['Toilets', 'Separate facilities for boys and girls'],
  ['CCTV surveillance', 'Installed in corridors and common areas'],
  ['School transport', 'GPS-enabled buses with attendants'],
  ['Ramp for differently-abled', 'To be updated'],
];

function Table({ title, rows }) {
  return (
    <section>
      <SectionHeading align="left" title={title} className="!max-w-none" />
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map(([k, v]) => (
              <tr key={k} className="transition hover:bg-slate-50">
                <th scope="row" className="w-1/2 px-5 py-3.5 text-left align-top font-medium text-slate-500 sm:w-2/5">{k}</th>
                <td className="px-5 py-3.5 font-semibold text-navy-800">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function DisclosurePage() {
  const uploads = (await apiGet('/downloads?category=mandatory_disclosure', { fallback: [] })) || [];
  const uploadedTitles = new Set(uploads.map((u) => u.title.toLowerCase()));

  return (
    <>
      <PageHero eyebrow="Transparency" title="Mandatory Public Disclosure"
        subtitle="General, academic, staff and infrastructure information published in the interest of parents and the regulatory authorities."
        breadcrumb={[{ label: 'Mandatory Disclosure' }]} />

      <section className="section">
        <div className="container-page max-w-4xl space-y-12">
          <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div className="text-sm text-amber-900">
              <p className="font-semibold">Some entries are still being compiled</p>
              <p className="mt-1 leading-relaxed">
                Rows marked &ldquo;To be updated&rdquo; are being verified by the school office and will be published as soon as the
                figures and certificates are confirmed. Originals of all statutory documents may be inspected at the school office
                during working hours.
              </p>
            </div>
          </div>

          <Table title="A. General Information" rows={GENERAL} />
          <Table title="B. Academic Information" rows={ACADEMIC} />
          <Table title="C. Infrastructure" rows={INFRA} />

          <section>
            <SectionHeading align="left" title="D. Statutory Documents & Certificates" className="!max-w-none" />
            <ul className="mt-5 space-y-2.5">
              {DOCUMENTS.map((d) => {
                const uploaded = uploads.find((u) => u.title.toLowerCase().includes(d.toLowerCase().slice(0, 18)));
                return (
                  <li key={d} className="card flex items-center gap-4 p-4">
                    <FileText className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                    <span className="min-w-0 flex-1 text-sm font-medium text-navy-800">{d}</span>
                    {uploaded ? (
                      <a href={uploaded.file?.url} target="_blank" rel="noopener noreferrer"
                        className="chip shrink-0 bg-brand-50 text-brand-700 ring-brand-200 hover:bg-brand-100">
                        View <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    ) : (
                      <span className="chip shrink-0 bg-slate-100 text-slate-500 ring-slate-200">At school office</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <SectionHeading align="left" title="E. Staff Information" className="!max-w-none" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              The complete list of teaching and non-teaching staff — with names, designations, qualifications and experience —
              is published on the <Link href="/faculty" className="font-semibold text-brand-700 hover:underline">Faculty page</Link> and
              is updated as appointments are made.
            </p>
          </section>

          <section className="rounded-xl bg-slate-50 p-6">
            <h2 className="font-display text-lg font-bold">Grievance redressal</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Any parent, student or member of staff with a grievance may write to the Principal at{' '}
              <a href={`mailto:${SCHOOL.email}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.email}</a>,
              call <a href={`tel:+91${SCHOOL.phone}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.phoneDisplay}</a>,
              or submit a written complaint at the school office. Every complaint is acknowledged and a response is given within
              seven working days.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
