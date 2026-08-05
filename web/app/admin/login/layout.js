/**
 * Overrides the admin shell for the sign-in page.
 * Without this, AdminShell would see no session and bounce the user
 * back to /admin/login forever.
 */
export const metadata = { title: 'Admin Sign In', robots: { index: false, follow: false } };

export default function AdminLoginLayout({ children }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
