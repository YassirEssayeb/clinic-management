"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPatientProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true, image: true, phone: true } },
    },
  })

  if (!patient) throw new Error("Patient profile not found")

  return patient
}

export async function getMyAppointments(params?: {
  page?: number
  pageSize?: number
  status?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { patientId: patient.id }

  if (params?.status) {
    where.status = params.status
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, image: true, phone: true } },
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

export async function bookAppointment(data: {
  doctorId: string
  date: string
  time: string
  type?: string
  reason?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: data.doctorId,
      date: new Date(data.date),
      time: data.time,
      type: data.type,
      reason: data.reason,
      status: "PENDING",
    },
    include: {
      doctor: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  })

  revalidatePath("/patient/appointments")
  return { success: true, data: appointment }
}

export async function getMyMedicalRecords(params?: {
  page?: number
  pageSize?: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { patientId: patient.id }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        prescriptions: {
          select: { id: true, medicineName: true, dosage: true, frequency: true, duration: true },
        },
        labResults: true,
      },
      orderBy: { visitDate: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.medicalRecord.count({ where }),
  ])

  return {
    data: records,
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

export async function getMyInvoices(params?: {
  page?: number
  pageSize?: number
  status?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { patientId: patient.id }

  if (params?.status) {
    where.status = params.status
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ])

  return {
    data: invoices,
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

export async function getMyPrescriptions(params?: {
  page?: number
  pageSize?: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { patientId: patient.id }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        medicalRecord: { select: { diagnosis: true } },
      },
      orderBy: { datePrescribed: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.prescription.count({ where }),
  ])

  return {
    data: prescriptions,
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

export async function getAvailableDoctors() {
  const doctors = await prisma.doctor.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { user: { name: "asc" } },
  })

  return doctors
}

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  })

  if (!patient) throw new Error("Patient not found")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalAppointments, upcomingAppointments, completedAppointments, totalRecords, totalInvoices, unpaidInvoices] =
    await Promise.all([
      prisma.appointment.count({ where: { patientId: patient.id } }),
      prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          doctor: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        take: 5,
      }),
      prisma.appointment.count({
        where: { patientId: patient.id, status: "COMPLETED" },
      }),
      prisma.medicalRecord.count({ where: { patientId: patient.id } }),
      prisma.invoice.count({ where: { patientId: patient.id } }),
      prisma.invoice.count({
        where: { patientId: patient.id, status: { in: ["UNPAID", "PARTIAL"] } },
      }),
    ])

  return {
    totalAppointments,
    completedAppointments,
    totalRecords,
    totalInvoices,
    unpaidInvoices,
    upcomingAppointments: (upcomingAppointments as any[]).map((a: any) => ({
      id: a.id,
      doctorName: a.doctor.user.name,
      doctorImage: a.doctor.user.image,
      specialization: a.doctor.specialization,
      date: a.date,
      time: a.time,
      status: a.status,
    })),
  }
}
