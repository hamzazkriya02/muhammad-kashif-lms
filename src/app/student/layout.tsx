import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import StudentShell from "@/components/student/StudentShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") redirect("/login");

  return <StudentShell userName={user.name} userEmail={user.email}>{children}</StudentShell>;
}
