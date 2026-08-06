import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, Prose } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;
export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${SCHOOL.name} collects, uses and protects the personal information shared through this website.`,
  path: '/privacy-policy',
});

const FALLBACK = { body: `Rise UP Public School collects personal information through this website only for the purposes of processing admission enquiries, responding to messages, and operating the student and parent portal.
WHAT WE COLLECT — Name, mobile number, email address, the child's name, date of birth and the class applied for; and, for enrolled students, academic and fee records.
HOW WE USE IT — Solely to contact you about your enquiry, to administer admission and academic processes, and to send you school notices. We do not sell, rent or trade personal information to any third party.
WHO WE SHARE IT WITH — Only with service providers who help operate the site (hosting, email, SMS and payment processing), and only to the extent necessary to deliver that service. Payment card details are handled entirely by the payment gateway and are never stored on our servers.
CHILDREN'S DATA — Information about a child is collected with the consent of the parent or lawful guardian, in accordance with the Digital Personal Data Protection Act, 2023.
YOUR RIGHTS — You may ask us to show, correct or delete the information we hold about you by writing to riseuppublicschool48@gmail.com or by visiting the school office.
RETENTION — Enquiry records are retained for two academic sessions; student academic records are retained as required by education regulations.
COOKIES — This website uses only the cookies necessary to keep you signed in to the parent portal. We do not use advertising cookies.` };

export default async function PrivacyPage() {
  const page = await apiGet('/pages/privacy-policy', { fallback: FALLBACK });

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy"
        subtitle="How we handle the information you share with us."
        breadcrumb={[{ label: 'Privacy Policy' }]} />
      <section className="section">
        <div className="container-page max-w-3xl">
          <Prose text={page.body} className="text-base" />
          <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            Questions about this policy? Write to{' '}
            <a href={`mailto:${SCHOOL.email}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.email}</a>{' '}
            or call <a href={`tel:+91${SCHOOL.phone}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.phoneDisplay}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
