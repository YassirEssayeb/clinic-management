"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"


export async function getDoctorProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, image: true, phone: true } } },
  })

  if (!doctor) throw new Error("Doctor profile not found")

  return doctor
}

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayAppointments, totalPatients, pendingPrescriptions, upcomingAppointments, recentPatients] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          date: { gte: today, lt: tomorrow },
        },
      }),
      prisma.appointment.groupBy({
        by: ["patientId"],
        where: { doctorId: doctor.id },
      }),
      prisma.prescription.count({
        where: { doctorId: doctor.id },
      }),
      prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          patient: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        take: 5,
      }),
      prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: { select: { name: true, email: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        distinct: ["patientId"],
      }),
    ])

  const todayConfirmed = await prisma.appointment.count({
    where: {
      doctorId: doctor.id,
      date: { gte: today, lt: tomorrow },
      status: "CONFIRMED",
    },
  })

  const todayCompleted = await prisma.appointment.count({
    where: {
      doctorId: doctor.id,
      date: { gte: today, lt: tomorrow },
      status: "COMPLETED",
    },
  })

  return {
    todayAppointments,
    todayConfirmed,
    todayCompleted,
    totalPatients: totalPatients.length,
    pendingPrescriptions,
    upcomingAppointments: (upcomingAppointments as any[]).map((a: any) => ({
      id: a.id,
      patientName: a.patient.user.name,
      patientImage: a.patient.user.image,
      date: a.date,
      time: a.time,
      status: a.status,
      reason: a.reason,
    })),
    recentPatients: (recentPatients as any[]).map((a: any) => ({
      id: a.patient.id,
      name: a.patient.user.name,
      email: a.patient.user.email,
      image: a.patient.user.image,
      lastVisit: a.date,
      status: a.status,
    })),
  }
}

export async function getMyAppointments(params?: {
  page?: number
  pageSize?: number
  status?: string
  search?: string
  fromDate?: string
  toDate?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { doctorId: doctor.id }

  if (params?.status) {
    where.status = params.status
  }

  if (params?.search) {
    where.patient = {
      user: {
        name: { contains: params.search, mode: "insensitive" },
      },
    }
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

export async function getMyPatients(params?: {
  page?: number
  pageSize?: number
  search?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const patientIds = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    select: { patientId: true },
    distinct: ["patientId"],
  })

  const ids = (patientIds as any[]).map((p: any) => p.patientId)

  const where: Record<string, any> = { id: { in: ids } }

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
          where: { doctorId: doctor.id },
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

export async function getMedicalRecords(params?: {
  page?: number
  pageSize?: number
  patientId?: string
  search?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { doctorId: doctor.id }

  if (params?.patientId) {
    where.patientId = params.patientId
  }

  if (params?.search) {
    where.OR = [
      { diagnosis: { contains: params.search, mode: "insensitive" } },
      { symptoms: { contains: params.search, mode: "insensitive" } },
      { patient: { user: { name: { contains: params.search, mode: "insensitive" } } } },
    ]
  }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, image: true } },
          },
        },
        prescriptions: { select: { id: true, medicineName: true } },
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

export async function createMedicalRecord(data: {
  patientId: string
  diagnosis?: string
  symptoms?: string
  treatment?: string
  notes?: string
  visitDate?: string
  followUpDate?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: data.patientId,
      doctorId: doctor.id,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      treatment: data.treatment,
      notes: data.notes,
      visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    },
    include: {
      patient: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  })

  revalidatePath("/doctor/medical-records")
  return { success: true, data: record }
}

export async function createPrescription(data: {
  medicalRecordId: string
  patientId: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const prescription = await prisma.prescription.create({
    data: {
      medicalRecordId: data.medicalRecordId,
      patientId: data.patientId,
      doctorId: doctor.id,
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      instructions: data.instructions,
      notes: data.notes,
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      medicalRecord: { select: { diagnosis: true } },
    },
  })

  revalidatePath("/doctor/prescriptions")
  return { success: true, data: prescription }
}

export async function getMyPrescriptions(params?: {
  page?: number
  pageSize?: number
  patientId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const skip = (page - 1) * pageSize

  const where: Record<string, any> = { doctorId: doctor.id }

  if (params?.patientId) {
    where.patientId = params.patientId
  }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, image: true } } } },
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

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  })

  if (!doctor) throw new Error("Doctor not found")

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId: doctor.id },
  })

  if (!appointment) throw new Error("Appointment not found")

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: { include: { user: { select: { name: true } } } },
    },
  })

  revalidatePath("/doctor/appointments")
  return { success: true, data: updated }
}
