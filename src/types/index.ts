export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  monthlyRevenue: number
  revenueChange: number
  patientChange: number
  appointmentChange: number
  revenueByMonth: { name: string; value: number }[]
  appointmentsByStatus: { name: string; value: number }[]
  appointmentsByWeekday: { name: string; value: number }[]
  recentPatients: any[]
  upcomingAppointments: any[]
  topDoctors: any[]
}

declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}


