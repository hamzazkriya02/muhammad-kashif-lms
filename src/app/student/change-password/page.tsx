import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function StudentChangePasswordPage() {
  return <div className="app-page"><div className="mb-6"><p className="eyebrow">Account Security</p><h1 className="page-title mt-1">Change Password</h1><p className="page-subtitle">Update your password and sign out of old sessions.</p></div><div className="max-w-xl"><ChangePasswordForm /></div></div>;
}
