import { Monitor, FlaskConical, BookOpen, Trophy, Bus, ShieldCheck, Music, Map } from 'lucide-react';
import { SectionHeading } from '@/components/ui';

const FACILITIES = [
  { Icon: Monitor, title: 'Digital Smart Classrooms', text: 'Projector-enabled rooms with syllabus-mapped digital content, so concepts are seen and not only heard.' },
  { Icon: FlaskConical, title: 'Science & Computer Labs', text: 'Well-equipped laboratories where students perform experiments themselves rather than watching demonstrations.' },
  { Icon: BookOpen, title: 'Library & Reading Room', text: 'A growing collection in English and Hindi, with dedicated library periods built into the timetable.' },
  { Icon: Trophy, title: 'Sports & Physical Education', text: 'Open playgrounds, an annual Sports Week, and structured karate and yoga training for every class.' },
  { Icon: Music, title: 'Music, Dance & Arts', text: 'Regular training in classical and folk dance, group singing and drawing — showcased at the Annual Function.' },
  { Icon: Bus, title: 'GPS-Enabled Transport', text: 'School buses covering villages around Aurai, with GPS tracking and a trained attendant on every route.' },
  { Icon: ShieldCheck, title: 'CCTV & Campus Safety', text: 'CCTV coverage of corridors and common areas, controlled entry, first-aid provision and fire safety equipment.' },
  { Icon: Map, title: 'Educational Tours', text: 'Annual excursions connecting classroom learning to heritage sites, science centres and the wider world.' },
];

export default function Highlights() {
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why Rise UP"
          title="A campus built for learning, not converted for it"
          description="Every facility on our campus at Pipargaon exists because a child needs it — and each one is expanded every session as the school grows."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map(({ Icon, title, text }) => (
            <article key={title} className="card-hover group p-6">
              <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-[17px] font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
