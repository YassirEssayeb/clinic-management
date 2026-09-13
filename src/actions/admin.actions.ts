"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ApiResponse, PaginationMeta, DashboardStats } from "@/types"
import bcrypt from "bcryptjs"

async function checkAdminAuth() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required")
  }
  return session.user
}

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    await checkAdminAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsThisMonth,
      todayAppointments,
      revenueResult,
      monthlyRevenueResult,
      recentPatients,
      latestAppointments,
      revenueByMonth,
      appointmentsByStatus,
      appointmentsByWeekday,
      patientGrowth,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      lastMonthRevenue,
      lastMonthPatients,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.appointment.count({ where: { date: { gte: startOfToday } } }),
      prisma.invoice.aggregate({ _sum: { total: true } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth }, status: "PAID" },
      }),
      prisma.patient.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, image: true } } },
      }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.$queryRaw<{ name: string; value: number }[]>`
        SELECT DATE_FORMAT(date, '%b') as name, CAST(COUNT(*) AS SIGNED) as value
        FROM Appointment
        WHERE date >= DATE_FORMAT(CURRENT_DATE, '%Y-01-01')
        GROUP BY DATE_FORMAT(date, '%b'), EXTRACT(MONTH FROM date)
        ORDER BY EXTRACT(MONTH FROM date)
      `,
      prisma.appointment.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.$queryRaw<{ name: string; value: number }[]>`
        SELECT DAYNAME(date) as name, CAST(COUNT(*) AS SIGNED) as value
        FROM Appointment
        WHERE date >= CURRENT_DATE - INTERVAL 30 DAY
        GROUP BY DAYNAME(date), DAYOFWEEK(date)
        ORDER BY DAYOFWEEK(date)
      `,
      prisma.$queryRaw<{ name: string; value: number }[]>`
        SELECT DATE_FORMAT(createdAt, '%b') as name, CAST(COUNT(*) AS SIGNED) as value
        FROM Patient
        WHERE createdAt >= DATE_FORMAT(CURRENT_DATE, '%Y-01-01')
        GROUP BY DATE_FORMAT(createdAt, '%b'), EXTRACT(MONTH FROM createdAt)
        ORDER BY EXTRACT(MONTH FROM createdAt)
      `,
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth,
          },
          status: "PAID",
        },
      }),
      prisma.patient.count({
        where: { createdAt: { lt: startOfMonth } },
      }),
    ])

    const totalRevenue = revenueResult._sum.total ?? 0
    const monthlyRevenue = monthlyRevenueResult._sum.total ?? 0
    const lastMonthRev = lastMonthRevenue._sum.total ?? 0
    const prevMonthPatients = lastMonthPatients

    const statusMap: Record<string, number> = {}
    for (const s of appointmentsByStatus) {
      statusMap[s.status] = s._count.id
    }

    return {
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
        todayAppointments: todayAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        monthlyRevenue,
        revenueChange: lastMonthRev > 0 ? ((monthlyRevenue - lastMonthRev) / lastMonthRev) * 100 : 0,
        patientChange: prevMonthPatients > 0 ? ((totalPatients - prevMonthPatients) / prevMonthPatients) * 100 : 0,
        appointmentChange: 0,
        revenueByMonth: (revenueByMonth as { name: string; value: number }[]).map((r) => ({ ...r, value: Number(r.value) })),
        appointmentsByStatus: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        appointmentsByWeekday: (appointmentsByWeekday as { name: string; value: number }[]).map((d) => ({
          ...d,
          name: d.name.trim(),
          value: Number(d.value),
        })),
        recentPatients: (recentPatients as any[]).map((p: any) => ({
          id: p.id,
          name: p.user.name,
          email: p.user.email,
          dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
          gender: p.gender,
          createdAt: p.createdAt,
        })),
        upcomingAppointments: (latestAppointments as any[]).map((a: any) => ({
          id: a.id,
          patientName: a.patient.user.name,
          doctorName: a.doctor.user.name,
          date: a.date,
          time: a.time,
          status: a.status,
        })),
        topDoctors: [],
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getDashboardStats error:", error)
    return { success: false, error: "Failed to fetch dashboard statistics" }
  }
}

export async function getDoctors(params: {
  search?: string
  specialization?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, specialization, status, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }
    if (specialization) where.specialization = { contains: specialization, mode: "insensitive" }
    if (status) where.status = status

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true, phone: true } },
          _count: { select: { appointments: true } },
        },
      }),
      prisma.doctor.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: doctors, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getDoctors error:", error)
    return { success: false, error: "Failed to fetch doctors" }
  }
}

export async function createDoctor(data: {
  name: string
  email: string
  phone?: string
  password?: string
  specialization: string
  licenseNumber: string
  qualification: string
  experienceYears: number
  consultationFee: number
  salary?: number
  bio?: string
  status?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) {
      return { success: false, error: "A user with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(data.password ?? "password123", 12)

    const doctor = await prisma.doctor.create({
      data: {
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        qualification: data.qualification,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
        salary: data.salary,
        bio: data.bio,
        status: data.status ?? "ACTIVE",
        user: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            role: "DOCTOR",
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      },
    })

    return { success: true, data: doctor, message: "Doctor created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createDoctor error:", error)
    return { success: false, error: "Failed to create doctor" }
  }
}

export async function updateDoctor(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    specialization?: string
    licenseNumber?: string
    qualification?: string
    experienceYears?: number
    consultationFee?: number
    salary?: number
    bio?: string
    status?: string
  }
): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!doctor) return { success: false, error: "Doctor not found" }

    const userData: Record<string, any> = {}
    if (data.name) userData.name = data.name
    if (data.email) userData.email = data.email
    if (data.phone !== undefined) userData.phone = data.phone

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({ where: { id: doctor.userId }, data: userData })
    }

    const doctorData: Record<string, any> = {}
    if (data.specialization) doctorData.specialization = data.specialization
    if (data.licenseNumber) doctorData.licenseNumber = data.licenseNumber
    if (data.qualification) doctorData.qualification = data.qualification
    if (data.experienceYears !== undefined) doctorData.experienceYears = data.experienceYears
    if (data.consultationFee !== undefined) doctorData.consultationFee = data.consultationFee
    if (data.salary !== undefined) doctorData.salary = data.salary
    if (data.bio !== undefined) doctorData.bio = data.bio
    if (data.status) doctorData.status = data.status

    const updated = await prisma.doctor.update({
      where: { id },
      data: doctorData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      },
    })

    return { success: true, data: updated, message: "Doctor updated successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("updateDoctor error:", error)
    return { success: false, error: "Failed to update doctor" }
  }
}

export async function deleteDoctor(id: string): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const doctor = await prisma.doctor.findUnique({ where: { id } })
    if (!doctor) return { success: false, error: "Doctor not found" }

    await prisma.doctor.delete({ where: { id } })
    await prisma.user.delete({ where: { id: doctor.userId } })

    return { success: true, message: "Doctor deleted successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("deleteDoctor error:", error)
    return { success: false, error: "Failed to delete doctor" }
  }
}

export async function getPatients(params: {
  search?: string
  gender?: string
  bloodGroup?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, gender, bloodGroup, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }
    if (gender) where.gender = gender
    if (bloodGroup) where.bloodGroup = bloodGroup

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true, phone: true } },
          _count: { select: { appointments: true, medicalRecords: true, invoices: true } },
        },
      }),
      prisma.patient.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: patients, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getPatients error:", error)
    return { success: false, error: "Failed to fetch patients" }
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
  insuranceProvider?: string
  insuranceNumber?: string
  address?: string
  allergies?: string
  chronicDiseases?: string
  height?: number
  weight?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) {
      return { success: false, error: "A user with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(data.password ?? "password123", 12)

    const patient = await prisma.patient.create({
      data: {
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: (data.gender ?? null) as any,
        bloodGroup: (data.bloodGroup ?? null) as any,
        emergencyContact: data.emergencyContact,
        emergencyName: data.emergencyName,
        insuranceProvider: data.insuranceProvider,
        insuranceNumber: data.insuranceNumber,
        address: data.address,
        allergies: data.allergies,
        chronicDiseases: data.chronicDiseases,
        height: data.height,
        weight: data.weight,
        user: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            role: "PATIENT",
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      },
    })

    return { success: true, data: patient, message: "Patient created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createPatient error:", error)
    return { success: false, error: "Failed to create patient" }
  }
}

export async function updatePatient(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    bloodGroup?: string
    emergencyContact?: string
    emergencyName?: string
    insuranceProvider?: string
    insuranceNumber?: string
    address?: string
    allergies?: string
    chronicDiseases?: string
    height?: number
    weight?: number
  }
): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const patient = await prisma.patient.findUnique({ where: { id }, include: { user: true } })
    if (!patient) return { success: false, error: "Patient not found" }

    const userData: Record<string, any> = {}
    if (data.name) userData.name = data.name
    if (data.email) userData.email = data.email
    if (data.phone !== undefined) userData.phone = data.phone
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({ where: { id: patient.userId }, data: userData })
    }

    const patientData: Record<string, any> = {}
    if (data.dateOfBirth !== undefined) patientData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    if (data.gender !== undefined) patientData.gender = data.gender
    if (data.bloodGroup !== undefined) patientData.bloodGroup = data.bloodGroup
    if (data.emergencyContact !== undefined) patientData.emergencyContact = data.emergencyContact
    if (data.emergencyName !== undefined) patientData.emergencyName = data.emergencyName
    if (data.insuranceProvider !== undefined) patientData.insuranceProvider = data.insuranceProvider
    if (data.insuranceNumber !== undefined) patientData.insuranceNumber = data.insuranceNumber
    if (data.address !== undefined) patientData.address = data.address
    if (data.allergies !== undefined) patientData.allergies = data.allergies
    if (data.chronicDiseases !== undefined) patientData.chronicDiseases = data.chronicDiseases
    if (data.height !== undefined) patientData.height = data.height
    if (data.weight !== undefined) patientData.weight = data.weight

    const updated = await prisma.patient.update({
      where: { id },
      data: patientData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      },
    })

    return { success: true, data: updated, message: "Patient updated successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("updatePatient error:", error)
    return { success: false, error: "Failed to update patient" }
  }
}

export async function deletePatient(id: string): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const patient = await prisma.patient.findUnique({ where: { id } })
    if (!patient) return { success: false, error: "Patient not found" }

    await prisma.patient.delete({ where: { id } })
    await prisma.user.delete({ where: { id: patient.userId } })

    return { success: true, message: "Patient deleted successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("deletePatient error:", error)
    return { success: false, error: "Failed to delete patient" }
  }
}

export async function getAppointments(params: {
  search?: string
  status?: string
  doctorId?: string
  patientId?: string
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, status, doctorId, patientId, fromDate, toDate, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (status) where.status = status
    if (doctorId) where.doctorId = doctorId
    if (patientId) where.patientId = patientId

    const dateFilter: Record<string, Date> = {}
    if (fromDate) dateFilter.gte = new Date(fromDate)
    if (toDate) dateFilter.lte = new Date(toDate)
    if (Object.keys(dateFilter).length > 0) where.date = dateFilter

    if (search) {
      where.OR = [
        { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
        { doctor: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          patient: { include: { user: { select: { name: true, email: true, image: true } } } },
          doctor: { include: { user: { select: { name: true, email: true, image: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: appointments, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getAppointments error:", error)
    return { success: false, error: "Failed to fetch appointments" }
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
  status?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        time: data.time,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: (data.status ?? "PENDING") as any,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    })

    return { success: true, data: appointment, message: "Appointment created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createAppointment error:", error)
    return { success: false, error: "Failed to create appointment" }
  }
}

export async function updateAppointment(
  id: string,
  data: {
    date?: string
    time?: string
    type?: string
    reason?: string
    notes?: string
    status?: string
  }
): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const updateData: Record<string, any> = {}
    if (data.date) updateData.date = new Date(data.date)
    if (data.time) updateData.time = data.time
    if (data.type !== undefined) updateData.type = data.type
    if (data.reason !== undefined) updateData.reason = data.reason
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.status) updateData.status = data.status as any

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    })

    return { success: true, data: updated, message: "Appointment updated successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("updateAppointment error:", error)
    return { success: false, error: "Failed to update appointment" }
  }
}

export async function deleteAppointment(id: string): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    await prisma.appointment.delete({ where: { id } })
    return { success: true, message: "Appointment deleted successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("deleteAppointment error:", error)
    return { success: false, error: "Failed to delete appointment" }
  }
}

export async function getMedicalRecords(params: {
  search?: string
  patientId?: string
  doctorId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, patientId, doctorId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (search) {
      where.OR = [
        { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
        { doctor: { user: { name: { contains: search, mode: "insensitive" } } } },
        { diagnosis: { contains: search, mode: "insensitive" } },
      ]
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { visitDate: "desc" },
        include: {
          patient: { include: { user: { select: { name: true, email: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
          _count: { select: { prescriptions: true, labResults: true } },
        },
      }),
      prisma.medicalRecord.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: records, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getMedicalRecords error:", error)
    return { success: false, error: "Failed to fetch medical records" }
  }
}

export async function createMedicalRecord(data: {
  patientId: string
  doctorId: string
  diagnosis?: string
  symptoms?: string
  treatment?: string
  notes?: string
  visitDate?: string
  followUpDate?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatment: data.treatment,
        notes: data.notes,
        visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    })

    return { success: true, data: record, message: "Medical record created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createMedicalRecord error:", error)
    return { success: false, error: "Failed to create medical record" }
  }
}

export async function updateMedicalRecord(
  id: string,
  data: {
    diagnosis?: string
    symptoms?: string
    treatment?: string
    notes?: string
    followUpDate?: string
  }
): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const updateData: Record<string, any> = {}
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis
    if (data.symptoms !== undefined) updateData.symptoms = data.symptoms
    if (data.treatment !== undefined) updateData.treatment = data.treatment
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.followUpDate !== undefined) updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null

    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: updateData,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    })

    return { success: true, data: updated, message: "Medical record updated successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("updateMedicalRecord error:", error)
    return { success: false, error: "Failed to update medical record" }
  }
}

export async function getPrescriptions(params: {
  search?: string
  patientId?: string
  doctorId?: string
  medicalRecordId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, patientId, doctorId, medicalRecordId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (medicalRecordId) where.medicalRecordId = medicalRecordId
    if (search) {
      where.OR = [
        { medicineName: { contains: search, mode: "insensitive" } },
        { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { datePrescribed: "desc" },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
          medicalRecord: { select: { id: true, diagnosis: true } },
        },
      }),
      prisma.prescription.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: prescriptions, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getPrescriptions error:", error)
    return { success: false, error: "Failed to fetch prescriptions" }
  }
}

export async function createPrescription(data: {
  medicalRecordId: string
  patientId: string
  doctorId: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  notes?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const prescription = await prisma.prescription.create({
      data: {
        medicalRecordId: data.medicalRecordId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        medicineName: data.medicineName,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        notes: data.notes,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        medicalRecord: { select: { id: true, diagnosis: true } },
      },
    })

    return { success: true, data: prescription, message: "Prescription created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createPrescription error:", error)
    return { success: false, error: "Failed to create prescription" }
  }
}

export async function getInvoices(params: {
  search?: string
  status?: string
  patientId?: string
  doctorId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, status, patientId, doctorId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (status) where.status = status
    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
          _count: { select: { payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: invoices, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getInvoices error:", error)
    return { success: false, error: "Failed to fetch invoices" }
  }
}

export async function createInvoice(data: {
  patientId: string
  doctorId: string
  appointmentId?: string
  consultationFee?: number
  medicineFee?: number
  labFee?: number
  otherFee?: number
  discount?: number
  tax?: number
  total: number
  status?: string
  dueDate?: string
  notes?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const count = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        consultationFee: data.consultationFee ?? 0,
        medicineFee: data.medicineFee ?? 0,
        labFee: data.labFee ?? 0,
        otherFee: data.otherFee ?? 0,
        discount: data.discount ?? 0,
        tax: data.tax ?? 0,
        total: data.total,
        status: (data.status ?? "UNPAID") as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    })

    return { success: true, data: invoice, message: "Invoice created successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createInvoice error:", error)
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: string
): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: status as any },
    })

    return { success: true, data: invoice, message: "Invoice status updated" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("updateInvoiceStatus error:", error)
    return { success: false, error: "Failed to update invoice status" }
  }
}

export async function getPayments(params: {
  search?: string
  status?: string
  method?: string
  invoiceId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { search, status, method, invoiceId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: Record<string, any> = {}
    if (status) where.status = status
    if (method) where.method = method
    if (invoiceId) where.invoiceId = invoiceId
    if (search) {
      where.invoice = { invoiceNumber: { contains: search, mode: "insensitive" } }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { paidAt: "desc" },
        include: {
          invoice: {
            include: {
              patient: { include: { user: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    }

    return { success: true, data: payments, meta }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getPayments error:", error)
    return { success: false, error: "Failed to fetch payments" }
  }
}

export async function createPayment(data: {
  invoiceId: string
  amount: number
  method: string
  status?: string
  transactionId?: string
  notes?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()

    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method as any,
        status: (data.status ?? "PAID") as any,
        transactionId: data.transactionId,
        notes: data.notes,
      },
      include: {
        invoice: {
          include: {
            patient: { include: { user: { select: { name: true } } } },
          },
        },
      },
    })

    return { success: true, data: payment, message: "Payment recorded successfully" }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("createPayment error:", error)
    return { success: false, error: "Failed to record payment" }
  }
}

export async function getRevenueReport(params: {
  fromDate?: string
  toDate?: string
  groupBy?: "day" | "week" | "month"
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { fromDate, toDate, groupBy = "month" } = params

    let groupFormat: string
    if (groupBy === "day") groupFormat = "YYYY-MM-DD"
    else if (groupBy === "week") groupFormat = "YYYY-WW"
    else groupFormat = "YYYY-MM"

    let query = `
      SELECT
        DATE_FORMAT(createdAt, '${groupFormat}') as period,
        SUM(total) as revenue,
        CAST(COUNT(*) AS SIGNED) as count
      FROM Invoice
      WHERE status = 'PAID'
    `
    const conditions: string[] = []
    if (fromDate) conditions.push(`createdAt >= '${new Date(fromDate).toISOString()}'`)
    if (toDate) conditions.push(`createdAt <= '${new Date(toDate).toISOString()}'`)
    if (conditions.length > 0) query += ` AND ${conditions.join(" AND ")}`
    query += " GROUP BY period ORDER BY period ASC"

    const data = await prisma.$queryRawUnsafe<{ period: string; revenue: number; count: number }[]>(query)

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getRevenueReport error:", error)
    return { success: false, error: "Failed to fetch revenue report" }
  }
}

export async function getAppointmentsReport(params: {
  fromDate?: string
  toDate?: string
  groupBy?: "day" | "week" | "month"
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { fromDate, toDate, groupBy = "month" } = params

    let groupFormat: string
    if (groupBy === "day") groupFormat = "YYYY-MM-DD"
    else if (groupBy === "week") groupFormat = "YYYY-WW"
    else groupFormat = "YYYY-MM"

    let query = `
      SELECT
        DATE_FORMAT(date, '${groupFormat}') as period,
        CAST(COUNT(*) AS SIGNED) as total,
        CAST(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS SIGNED) as completed,
        CAST(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS SIGNED) as cancelled
      FROM Appointment
      WHERE 1=1
    `
    if (fromDate) query += ` AND date >= '${new Date(fromDate).toISOString()}'`
    if (toDate) query += ` AND date <= '${new Date(toDate).toISOString()}'`
    query += " GROUP BY period ORDER BY period ASC"

    const data = await prisma.$queryRawUnsafe<{ period: string; total: number; completed: number; cancelled: number }[]>(query)

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getAppointmentsReport error:", error)
    return { success: false, error: "Failed to fetch appointments report" }
  }
}

export async function getDoctorsPerformanceReport(params: {
  fromDate?: string
  toDate?: string
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { fromDate, toDate } = params

    const appointmentFilter: Record<string, any> = {}
    if (fromDate) appointmentFilter.date = { ...(appointmentFilter.date || {}), gte: new Date(fromDate) }
    if (toDate) appointmentFilter.date = { ...(appointmentFilter.date || {}), lte: new Date(toDate) }

    const data = await prisma.doctor.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: {
          select: {
            appointments: Object.keys(appointmentFilter).length > 0 ? { where: appointmentFilter } : true,
          },
        },
      },
      orderBy: { appointments: { _count: "desc" } },
    })

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getDoctorsPerformanceReport error:", error)
    return { success: false, error: "Failed to fetch doctor performance" }
  }
}

export async function getPatientGrowthReport(params: {
  fromDate?: string
  toDate?: string
  groupBy?: "day" | "week" | "month"
}): Promise<ApiResponse> {
  try {
    await checkAdminAuth()
    const { fromDate, toDate, groupBy = "month" } = params

    let groupFormat: string
    if (groupBy === "day") groupFormat = "YYYY-MM-DD"
    else if (groupBy === "week") groupFormat = "YYYY-WW"
    else groupFormat = "YYYY-MM"

    let query = `
      SELECT
        DATE_FORMAT(createdAt, '${groupFormat}') as period,
        CAST(COUNT(*) AS SIGNED) as count
      FROM Patient
      WHERE 1=1
    `
    if (fromDate) query += ` AND createdAt >= '${new Date(fromDate).toISOString()}'`
    if (toDate) query += ` AND createdAt <= '${new Date(toDate).toISOString()}'`
    query += " GROUP BY period ORDER BY period ASC"

    const data = await prisma.$queryRawUnsafe<{ period: string; count: number }[]>(query)

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message }
    }
    console.error("getPatientGrowthReport error:", error)
    return { success: false, error: "Failed to fetch patient growth report" }
  }
}
