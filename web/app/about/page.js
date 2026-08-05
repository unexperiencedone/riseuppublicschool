import Image from 'next/image';
import Link from 'next/link';
import { Target, Eye, Heart, ArrowRight } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading, CtaBanner, Prose } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: 'About the School',
  description: `${SCHOOL.name} was founded in 2024 by the ${SCHOOL.trust} to bring English-medium, CBSE-pattern education to Pipargaon, Aurai, Bhadohi.`,
};

const FALLBACK = {
  body: `Rise UP Public School was founded in 2024 by the Rise UP Public Shiksha Seva Samiti Trust with a simple conviction: a child growing up in rural Bhadohi deserves exactly the same quality of education as a child in any metropolitan city.
Located at Pipargaon in Aurai block of Sant Ravidas Nagar (Bhadohi), the school follows an English-medium, CBSE-pattern curriculum from Play Group right through to Class XII. Our campus combines digital classrooms, well-equipped science and computer laboratories, a growing library and safe, spacious grounds for sport.
What sets us apart is not only infrastructure but attention. Small class sizes, regular parent-teacher meetings, and a teaching team that knows every child by name mean no student is ever left behind.`,
  sections: [
    { heading: 'Our Mission', content: 'To provide affordable, high-quality English-medium education that develops academic excellence, moral character and practical life skills in every child we teach.' },
    { heading: 'Our Vision', content: 'To be the school of first choice in the Aurai region — a place where rural talent is discovered early, nurtured patiently, and equipped to compete confidently at the national level.' },
    { heading: 'Our Values', content: 'Discipline without fear. Curiosity before memorisation. Respect for every background. Honesty in assessment. Service to the community that surrounds us.' },
  ],
};

const ICONS = [Target, Eye, Heart];

export default async function AboutPage() {
  const page = await apiGet('/pages/about-us', { fallback: FALLBACK });

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building character, confidence and competence since 2024"
        subtitle={`Run by the ${SCHOOL.trust} at Pipargaon, Aurai, Sant Ravidas Nagar (Bhadohi).`}
        breadcrumb={[{ label: 'About' }]}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading align="left" eyebrow="Our Story" title="A school built for the children of Aurai" />
            <Prose text={page.body} className="mt-6" />

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Trust', SCHOOL.trust],
                ['Established', String(SCHOOL.established)],
                ['Classes offered', SCHOOL.classesOffered],
                ['Medium of instruction', 'English'],
                ['Curriculum', 'CBSE Pattern'],
                ['Location', `${SCHOOL.address.line1}, ${SCHOOL.address.district}`],
              ].map(([k, v]) => (
                <div key={k} className="card p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
                <Image src="/images/campus/school-building.jpg" alt="Rise UP Public School campus" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src="/images/gallery/morning-assembly-mass-drill.jpg" alt="Morning assembly" fill sizes="20vw" className="object-cover" />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src="/images/gallery/science-exhibition.jpg" alt="Science exhibition" fill sizes="20vw" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="section bg-slate-50 scroll-mt-32">
        <div className="container-page">
          <SectionHeading eyebrow="What guides us" title="Mission, Vision & Values" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(page.sections || FALLBACK.sections).map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <article key={s.heading} className="card-hover p-7">
                  <span className="inline-flex rounded-xl bg-brand-600 p-3 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">{s.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.content}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <Link href="/about/founder-message" className="card-hover group flex items-center justify-between gap-4 p-6">
              <div>
                <p className="eyebrow">Message</p>
                <h3 className="mt-1 font-display text-lg font-bold">From the Founder & CEO</h3>
                <p className="mt-1 text-sm text-slate-600">{SCHOOL.leadership.founder.name}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/about/principal-message" className="card-hover group flex items-center justify-between gap-4 p-6">
              <div>
                <p className="eyebrow">Message</p>
                <h3 className="mt-1 font-display text-lg font-bold">From the Principal</h3>
                <p className="mt-1 text-sm text-slate-600">{SCHOOL.leadership.principal.name}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
