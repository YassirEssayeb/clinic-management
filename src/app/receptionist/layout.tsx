import DashboardLayout from "@/components/layout/dashboard-layout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "RECEPTIONIST") redirect("/login")

  return (
    <DashboardLayout title="Reception Desk" role="RECEPTIONIST" user={session.user}>
      {children}
    </DashboardLayout>
  )
}
