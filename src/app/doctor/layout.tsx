import DashboardLayout from "@/components/layout/dashboard-layout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "DOCTOR") redirect("/login")

  return (
    <DashboardLayout title="Doctor Dashboard" role="DOCTOR" user={session.user}>
      {children}
    </DashboardLayout>
  )
}
