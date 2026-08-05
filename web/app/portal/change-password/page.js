import ChangePasswordForm from '@/components/portal/ChangePasswordForm';

export const metadata = {
  title: 'Change Password',
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center bg-slate-50 px-4 py-16">
      <ChangePasswordForm />
    </div>
  );
}
