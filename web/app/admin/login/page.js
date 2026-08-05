import LoginForm from '@/components/portal/LoginForm';

export const metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center bg-slate-50 px-4 py-16">
      <LoginForm redirectTo="/admin" title="School Admin Panel"
        subtitle="For school staff only. Manage notices, admissions, gallery, students and fees." />
    </div>
  );
}
