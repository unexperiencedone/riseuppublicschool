import { Stat } from '@/components/ui';
import { SCHOOL } from '@/lib/config';

export default function StatsBand() {
  const years = new Date().getFullYear() - SCHOOL.established;
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <div className="container-page grid grid-cols-2 gap-8 sm:grid-cols-4">
        <Stat value={SCHOOL.established} label="Established" />
        <Stat value={16} label="Classes offered" suffix="" />
        <Stat value={4} label="PTMs every session" />
        <Stat value={years < 1 ? 1 : years} label="Years of service" suffix="+" />
      </div>
    </section>
  );
}
