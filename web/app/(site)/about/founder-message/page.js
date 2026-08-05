import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, Prose, CtaBanner } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: "Founder's Message",
  description: `A message from ${SCHOOL.leadership.founder.name}, Founder & CEO of ${SCHOOL.name}.`,
};

const FALLBACK = { body: `Rise UP Public School began with a question I could not stop asking: why should a child's postcode decide the quality of their schooling?
Through the Rise UP Public Shiksha Seva Samiti Trust, we set out to build in Pipargaon a school of the standard families here usually have to travel to Bhadohi or Varanasi to find — English medium, CBSE pattern, digitally equipped, and affordable.
We are still early in that journey. But when I watch our students present working models at the science exhibition, or march past on Sports Day, or return from an educational tour full of questions, I know the direction is right.
My commitment to every family who chooses us is this: your fees will be spent on your child's classroom, and your child's progress will be measured honestly.` };

export default async function FounderMessagePage() {
  const page = await apiGet('/pages/founder-message', { fallback: FALLBACK });
  const f = SCHOOL.leadership.founder;

  return (
    <>
      <PageHero eyebrow="Leadership" title="Founder's Message"
        subtitle={`${f.name} — ${f.role}`}
        breadcrumb={[{ label: 'About', href: '/about' }, { label: "Founder's Message" }]} />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="card sticky top-32 p-7 text-center">
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy-600 font-display text-2xl font-bold text-white" aria-hidden>RD</span>
              <h2 className="mt-4 font-display text-xl font-bold">{f.name}</h2>
              <p className="text-sm font-semibold text-brand-600">{f.role}</p>
              <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-left text-sm">
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Qualifications</dt><dd className="font-medium text-navy-800">{f.qualifications}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Experience</dt><dd className="font-medium text-navy-800">{f.experience}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Trust</dt><dd className="font-medium text-navy-800">{SCHOOL.trust}</dd></div>
              </dl>
            </div>
          </aside>

          <article className="lg:col-span-8">
            <Prose text={page.body} className="text-base" />
            <p className="mt-8 border-t border-slate-200 pt-6 font-display text-lg font-bold text-navy-800">
              {f.name}
              <span className="block text-sm font-normal text-slate-500">{f.role}, {SCHOOL.name}</span>
            </p>
          </article>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
