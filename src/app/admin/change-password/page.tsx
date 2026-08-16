import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function AdminChangePasswordPage() {
  return <div className="app-page"><div className="mb-6"><p className="eyebrow">Account Security</p><h1 className="page-title mt-1">Change Password</h1><p className="page-subtitle">Protect your administrator account with a strong password.</p></div><div className="max-w-xl"><ChangePasswordForm /></div></div>;
}
