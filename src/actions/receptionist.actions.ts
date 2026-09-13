"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"


export async function getReceptionistProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const receptionist = await prisma.receptionist.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, image: true, phone: true } } },
  })

  if (!receptionist) throw new Error("Receptionist profile not found")

  return receptionist
}

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    todayAppointments,
    pendingAppointments,
    totalPatients,
    totalDoctors,
    upcomingAppointments,
    recentPatients,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.appointment.count({
      where: { status: "PENDING" },
    }),
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.findMany({
      where: {
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        patient: { include: { user: { select: { name: true, image: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 10,
    }),
    prisma.patient.findMany({
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return {
    todayAppointments,
    pendingAppointments,
    totalPatients,
    totalDoctors,
    upcomingAppointments: (upcomingAppointments as any[]).map((a: any) => ({
      id: a.id,
      patientName: a.patient.user.name,
      doctorName: a.doctor.user.name,
      date: a.date,
      time: a.time,
      status: a.status,
    })),
    recentPatients: (recentPatients as any[]).map((p: any) => ({
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      image: p.user.image,
    })),
  }
}

export async function getAppointments(params?: {
  page?: number
  pageSize?: number
  status?: string
  search?: string
  doctorId?: string
  fromDate?: string
  toDate?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = {}

  if (params?.status) {
    where.status = params.status
  }

  if (params?.doctorId) {
    where.doctorId = params.doctorId
  }

  if (params?.search) {
    where.OR = [
      { patient: { user: { name: { contains: params.search, mode: "insensitive" } } } },
      { doctor: { user: { name: { contains: params.search, mode: "insensitive" } } } },
    ]
  }

  if (params?.fromDate || params?.toDate) {
    where.date = {}
    if (params.fromDate) where.date.gte = new Date(params.fromDate)
    if (params.toDate) where.date.lte = new Date(params.toDate)
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, image: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ])

  return {
    data: appointments,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrevious: page > 1,
    },
  }
}

export async function createAppointment(data: {
  patientId: string
  doctorId: string
  date: string
  time: string
  type?: string
  reason?: string
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: new Date(data.date),
      time: data.time,
      type: data.type,
      reason: data.reason,
      notes: data.notes,
      status: "PENDING",
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })

  revalidatePath("/receptionist/appointments")
  return { success: true, data: appointment }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })

  revalidatePath("/receptionist/appointments")
  return { success: true, data: updated }
}

export async function getPatients(params?: {
  page?: number
  pageSize?: number
  search?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = {}

  if (params?.search) {
    where.user = {
      name: { contains: params.search, mode: "insensitive" },
    }
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true, phone: true } },
        appointments: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.patient.count({ where }),
  ])

  return {
    data: (patients as any[]).map((p: any) => ({
      ...p,
      lastVisit: p.appointments[0]?.date ?? null,
      lastStatus: p.appointments[0]?.status ?? null,
    })),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrevious: page > 1,
    },
  }
}

export async function createPatient(data: {
  name: string
  email: string
  phone?: string
  password?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  emergencyContact?: string
  emergencyName?: string
  address?: string
  allergies?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) throw new Error("A user with this email already exists")

  const passwordHash = data.password
    ? await bcrypt.hash(data.password, 12)
    : await bcrypt.hash("default123", 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: "PATIENT",
      patient: {
        create: {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: (data.gender as any) ?? null,
          bloodGroup: (data.bloodGroup as any) ?? null,
          emergencyContact: data.emergencyContact,
          emergencyName: data.emergencyName,
          address: data.address,
          allergies: data.allergies,
        },
      },
    },
    include: {
      patient: true,
    },
  })

  revalidatePath("/receptionist/patients")
  return { success: true, data: user }
}

export async function searchDoctors(query?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const where: Record<string, any> = {
    status: "ACTIVE",
  }

  if (query) {
    where.user = {
      name: { contains: query, mode: "insensitive" },
    }
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
    orderBy: { user: { name: "asc" } },
  })

  return doctors
}
