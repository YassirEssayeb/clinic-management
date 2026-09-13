import DashboardLayout from "@/components/layout/dashboard-layout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PATIENT") redirect("/login")

  return (
    <DashboardLayout title="Patient Portal" role="PATIENT" user={session.user}>
      {children}
    </DashboardLayout>
  )
}
