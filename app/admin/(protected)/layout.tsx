import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/cms/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return <AdminShell username={session.username}>{children}</AdminShell>;
}
