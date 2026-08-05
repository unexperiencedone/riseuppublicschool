import PortalShell from '@/components/portal/PortalShell';

export const metadata = { title: 'Parent Portal', robots: { index: false, follow: false } };

export default function PortalDashboardLayout({ children }) {
  return <PortalShell>{children}</PortalShell>;
}
