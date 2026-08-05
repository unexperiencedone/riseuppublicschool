import LoginForm from '@/components/portal/LoginForm';

export const metadata = {
  title: 'Parent Portal Login',
  description: 'Sign in to the Rise UP Public School parent and student portal.',
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center bg-slate-50 px-4 py-16">
      <LoginForm />
    </div>
  );
}
