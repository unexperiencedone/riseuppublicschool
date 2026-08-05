import Link from 'next/link';
import { GraduationCap, Briefcase, Mail } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackStaff } from '@/lib/fallback';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading, CtaBanner } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: 'Our Faculty & Leadership',
  description: `Meet the leadership and teaching team at ${SCHOOL.name}, Pipargaon Aurai Bhadohi.`,
};

const initials = (name) => name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function StaffCard({ s, accent = 'bg-brand-600' }) {
  return (
    <article className="card-hover p-6 text-center">
      <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${accent} font-display text-xl font-bold text-white`} aria-hidden>
        {initials(s.name)}
      </span>
      <h3 className="mt-4 font-display text-lg font-bold">{s.name}</h3>
      <p className="text-sm font-semibold text-brand-600">{s.designation}</p>

      {s.qualifications?.length > 0 && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden /> {s.qualifications.join(', ')}
        </p>
      )}
      {s.experienceYears > 0 && (
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          {s.experienceYears}+ years{s.adminExperienceYears ? ` teaching · ${s.adminExperienceYears} years administration` : ' experience'}
        </p>
      )}
      {s.bio && <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">{s.bio}</p>}
    </article>
  );
}

export default async function FacultyPage() {
  const staff = (await apiGet('/staff', { fallback: fallbackStaff, tags: ['staff'] })) || [];
  const management = staff.filter((s) => s.category === 'management');
  const teaching = staff.filter((s) => s.category === 'teaching');
  const support = staff.filter((s) => s.category === 'non_teaching');

  return (
    <>
      <PageHero eyebrow="Our People" title="Faculty & Leadership"
        subtitle="A teaching team that knows every child by name — and a leadership that is present on campus every day."
        breadcrumb={[{ label: 'Faculty' }]} />

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Leadership" title="Management & Administration" />
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {management.map((s, i) => (
              <StaffCard key={s.name} s={s} accent={['bg-navy-600', 'bg-brand-600', 'bg-gold-600'][i % 3]} />
            ))}
          </div>
        </div>
      </section>

      {teaching.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container-page">
            <SectionHeading eyebrow="Teaching" title="Our Teachers" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teaching.map((s) => <StaffCard key={s.name} s={s} />)}
            </div>
          </div>
        </section>
      )}

      {support.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading eyebrow="Support" title="Administrative & Support Staff" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {support.map((s) => <StaffCard key={s.name} s={s} accent="bg-slate-500" />)}
            </div>
          </div>
        </section>
      )}

      {teaching.length === 0 && (
        <section className="pb-20">
          <div className="container-page max-w-2xl">
            <div className="rounded-xl border border-navy-200 bg-navy-50 p-6 text-center text-sm text-navy-900">
              <p className="font-semibold">Full teaching staff directory coming soon</p>
              <p className="mt-2 leading-relaxed">
                Profiles for our subject teachers — with names, qualifications, designation and experience — are being added
                through the school admin panel. In the meantime, you are welcome to meet the teaching team on a campus visit.
              </p>
              <Link href="/contact" className="btn-outline mt-4">
                <Mail className="h-4 w-4" aria-hidden /> Arrange a visit
              </Link>
            </div>
          </div>
        </section>
      )}

      <CtaBanner title="Interested in teaching with us?"
        description="We are always glad to hear from qualified, committed teachers who want to work in rural education."
        primary={{ href: '/contact', label: 'Send your CV' }} />
    </>
  );
}
