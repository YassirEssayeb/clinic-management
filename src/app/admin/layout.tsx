import DashboardLayout from "@/components/layout/dashboard-layout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  return (
    <DashboardLayout title="Admin Dashboard" role="ADMIN" user={session.user}>
      {children}
    </DashboardLayout>
  )
}
