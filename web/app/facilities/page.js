import Image from 'next/image';
import { Monitor, FlaskConical, BookOpen, Trophy, Bus, ShieldCheck, Music, Map, Utensils, HeartPulse } from 'lucide-react';
import { SCHOOL } from '@/lib/config';
import { PageHero, SectionHeading, CtaBanner } from '@/components/ui';

export const metadata = {
  title: 'Campus & Facilities',
  description: `Digital classrooms, science and computer laboratories, library, sports grounds, GPS-enabled transport and CCTV safety at ${SCHOOL.name}.`,
};

const FACILITIES = [
  { Icon: Monitor, title: 'Digital Smart Classrooms', text: 'Projector-enabled classrooms with digital content mapped to the syllabus. Difficult concepts — a cell dividing, a chemical reaction, a historical map — are shown, not just described.', image: '/images/gallery/science-exhibition.jpg' },
  { Icon: FlaskConical, title: 'Science & Computer Laboratories', text: 'Well-equipped laboratories where students perform experiments themselves. Computer periods from the primary classes upward build real digital literacy, not just theory.', image: '/images/gallery/students-outdoor-activity.jpg' },
  { Icon: BookOpen, title: 'Library & Reading Room', text: 'A growing collection of reference books, story books and periodicals in English and Hindi, with dedicated library periods built into the weekly timetable.', image: '/images/gallery/principal-counselling.jpg' },
  { Icon: Trophy, title: 'Sports Ground & Physical Education', text: 'Open playgrounds with athletics markings, an annual Sports Week and Sports Day, and structured karate and yoga training for every class.', image: '/images/gallery/march-past-sports-day.jpg' },
  { Icon: Music, title: 'Music, Dance & Performing Arts', text: 'Regular training in classical and folk dance, group singing and drawing, showcased at the Annual Function and at every national celebration.', image: '/images/gallery/annual-function-folk-dance.jpg' },
  { Icon: Bus, title: 'GPS-Enabled School Transport', text: 'School buses covering the villages around Aurai, each with GPS tracking and a trained attendant. Route availability is confirmed at the time of admission.', image: '/images/gallery/assembly-line-up.jpg' },
  { Icon: ShieldCheck, title: 'CCTV Surveillance & Campus Safety', text: 'CCTV coverage of corridors and common areas, controlled entry and exit, first-aid provision and fire safety equipment on every floor.', image: '/images/campus/school-building.jpg' },
  { Icon: Map, title: 'Educational Tours', text: 'Annual excursions that connect classroom learning to the world outside — heritage sites, science centres and places of cultural importance.', image: '/images/gallery/educational-tour-ayodhya.jpg' },
];

const SUPPORT = [
  { Icon: HeartPulse, title: 'First Aid & Health Checks', text: 'A stocked first-aid room and periodic health and vision checks for all students.' },
  { Icon: Utensils, title: 'Clean Drinking Water', text: 'Filtered drinking water points on every floor, cleaned and tested regularly.' },
  { Icon: ShieldCheck, title: 'Separate Sanitation', text: 'Separate, maintained toilet facilities for boys and girls, with daily cleaning.' },
];

export default function FacilitiesPage() {
  return (
    <>
      <PageHero eyebrow="Our Campus" title="Built for learning, not converted for it"
        subtitle="Every facility at Pipargaon exists because a child needs it — and each one is expanded every session as the school grows."
        breadcrumb={[{ label: 'Facilities' }]} />

      <section className="section">
        <div className="container-page space-y-6">
          {FACILITIES.map(({ Icon, title, text, image }, i) => (
            <article key={title} className={`card overflow-hidden lg:flex ${i % 2 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="relative h-56 w-full lg:h-auto lg:w-2/5">
                <Image src={image} alt="" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
              </div>
              <div className="flex-1 p-7 lg:p-9">
                <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading eyebrow="Health & Hygiene" title="The basics, done properly" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {SUPPORT.map(({ Icon, title, text }) => (
              <div key={title} className="card p-6">
                <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title="Come and see the campus for yourself"
        description="Visit us any working day between 8:00 AM and 3:00 PM. No appointment needed — though a call ahead helps us give you our full attention."
        primary={{ href: '/contact', label: 'Plan a Visit' }} />
    </>
  );
}
