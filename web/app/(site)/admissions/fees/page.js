import Link from 'next/link';
import { Info, Phone, IndianRupee } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading, EmptyState } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: 'Fee Structure 2026-27',
  description: `Published fee structure for ${SCHOOL.name}, session ${SCHOOL.session}. No donation or capitation fee.`,
};

const money = (n) => (n ? `₹ ${Number(n).toLocaleString('en-IN')}` : '—');

export default async function FeesPage() {
  const rows = (await apiGet('/fees/structure?session=2026-27', { fallback: [] })) || [];
  const published = rows.filter((r) => r.isPublished);

  return (
    <>
      <PageHero eyebrow={`Session ${SCHOOL.session}`} title="Fee Structure"
        subtitle="Published in full, in the interest of transparency. There is no donation or capitation fee of any kind."
        breadcrumb={[{ label: 'Admissions', href: '/admissions' }, { label: 'Fee Structure' }]} />

      <section className="section">
        <div className="container-page max-w-5xl">
          {published.length === 0 ? (
            <EmptyState
              title="Fee structure not yet published online"
              description="The approved fee schedule for this session has not been uploaded to the website yet. Please contact the school office for the current figures — they are also displayed on the office notice board."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <a href={`tel:+91${SCHOOL.phone}`} className="btn-primary"><Phone className="h-4 w-4" aria-hidden /> {SCHOOL.phoneDisplay}</a>
                  <Link href="/contact" className="btn-outline">Contact the school</Link>
                </div>
              }
            />
          ) : (
            <>
              <SectionHeading align="left" eyebrow="Published rates" title={`Fees for session ${SCHOOL.session}`} />
              <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <caption className="sr-only">Class-wise fee structure for session {SCHOOL.session}</caption>
                  <thead className="bg-navy-700 text-white">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Class</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Admission fee</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Tuition (monthly)</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Exam fee (per term)</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Transport (monthly)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {published.map((r) => (
                      <tr key={r.classLevel} className="transition hover:bg-slate-50">
                        <th scope="row" className="px-5 py-3.5 text-left font-semibold text-navy-800">{r.classLevel}</th>
                        <td className="px-5 py-3.5 text-right text-slate-600">{money(r.admissionFee)}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{money(r.tuitionFeeMonthly)}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{money(r.examFeePerTerm)}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{money(r.transportFeeMonthly)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <aside className="mt-10 flex gap-4 rounded-xl border border-navy-200 bg-navy-50 p-5">
            <Info className="h-5 w-5 shrink-0 text-navy-600" aria-hidden />
            <div className="text-sm text-navy-900">
              <p className="font-semibold">How fees are paid</p>
              <ul className="mt-2 space-y-1.5 leading-relaxed">
                <li>• Fees may be paid at the school office in cash or by cheque during office hours.</li>
                <li>• Online payment through the parent portal is being enabled — parents will be informed when it goes live.</li>
                <li>• A receipt is issued for every payment. Please retain it.</li>
                <li>• Transport charges apply only to students who opt for school transport.</li>
              </ul>
            </div>
          </aside>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/admissions#enquiry" className="btn-primary"><IndianRupee className="h-4 w-4" aria-hidden /> Enquire about admission</Link>
            <Link href="/downloads" className="btn-outline">Download forms &amp; documents</Link>
          </div>
        </div>
      </section>
    </>
  );
}
