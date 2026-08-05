import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, Prose, CtaBanner } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: "Principal's Message",
  description: `A message from ${SCHOOL.leadership.principal.name}, Principal of ${SCHOOL.name}.`,
};

const FALLBACK = { body: `Dear Parents and Students,
Welcome to Rise UP Public School.
When a school is young, every year matters. Since 2024 we have worked to build something that will still be serving this region decades from now — and the foundation of that is trust between the school and the family.
Our approach is deliberately balanced. We are serious about academics: regular unit tests, half-yearly and annual examinations, and four parent-teacher meetings every session mean that no child's difficulty goes unnoticed for long. But we are equally serious about everything that happens outside the textbook — the sports week, the science exhibition, the annual cultural evening, karate and dance training, and educational tours that take our students far beyond the boundaries of Pipargaon.
To parents, my request is simple: stay involved. Attend the PTMs. Ask to see the notebooks. Talk to us early when something is wrong. Education works best when the school and the home pull in the same direction.
To students: work honestly, be kind, and rise up.` };

export default async function PrincipalMessagePage() {
  const page = await apiGet('/pages/principal-message', { fallback: FALLBACK });
  const p = SCHOOL.leadership.principal;

  return (
    <>
      <PageHero eyebrow="Leadership" title="Principal's Message"
        subtitle={`${p.name} — ${p.qualifications}`}
        breadcrumb={[{ label: 'About', href: '/about' }, { label: "Principal's Message" }]} />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="card sticky top-32 p-7 text-center">
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 font-display text-2xl font-bold text-white" aria-hidden>AM</span>
              <h2 className="mt-4 font-display text-xl font-bold">{p.name}</h2>
              <p className="text-sm font-semibold text-brand-600">{p.role}</p>
              <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-left text-sm">
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Qualifications</dt><dd className="font-medium text-navy-800">{p.qualifications}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Teaching experience</dt><dd className="font-medium text-navy-800">5 years</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Administrative experience</dt><dd className="font-medium text-navy-800">3 years</dd></div>
              </dl>
            </div>
          </aside>

          <article className="lg:col-span-8">
            <Prose text={page.body} className="text-base" />
            <p className="mt-8 border-t border-slate-200 pt-6 font-display text-lg font-bold text-navy-800">
              {p.name}
              <span className="block text-sm font-normal text-slate-500">Principal, {SCHOOL.name}</span>
            </p>
          </article>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
