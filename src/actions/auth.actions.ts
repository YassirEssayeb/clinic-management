"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas"
import { AuthError } from "next-auth"
import crypto from "crypto"

export async function loginAction(data: z.input<typeof loginSchema>) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { role: true },
    })

    return { success: true, role: user?.role ?? "PATIENT" }
  } catch (error) {
    if (error instanceof AuthError)
      return { success: false, error: "Invalid credentials" }
    return { success: false, error: "Something went wrong" }
  }
}

export async function registerAction(data: z.input<typeof registerSchema>) {
  try {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (exists)
      return { success: false, error: "Email already in use" }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const role = data.role ?? "PATIENT"

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role,
        ...(role === "PATIENT" ? { patient: { create: {} } } : {}),
        ...(role === "DOCTOR"
          ? {
              doctor: {
                create: {
                  specialization: "General",
                  licenseNumber: `TEMP-${crypto.randomUUID().slice(0, 8)}`,
                  qualification: "Pending",
                },
              },
            }
          : {}),
        ...(role === "RECEPTIONIST" ? { receptionist: { create: {} } } : {}),
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create account" }
  }
}

export async function forgotPasswordAction(
  data: z.input<typeof forgotPasswordSchema>
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user)
      return {
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000)

    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        expires,
      },
    })

    return {
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    }
  } catch (error) {
    return { success: false, error: "Failed to send reset email" }
  }
}

export async function resetPasswordAction(
  data: z.input<typeof resetPasswordSchema>
) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: data.token },
    })

    if (!verificationToken)
      return { success: false, error: "Invalid or expired reset token" }

    if (verificationToken.expires < new Date())
      return { success: false, error: "Reset token has expired" }

    const passwordHash = await bcrypt.hash(data.password, 12)

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash },
    })

    await prisma.verificationToken.delete({
      where: { token: data.token },
    })

    return { success: true, message: "Password has been reset successfully" }
  } catch (error) {
    return { success: false, error: "Failed to reset password" }
  }
}

export async function verifyEmailAction(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken)
      return { success: false, error: "Invalid or expired verification token" }

    if (verificationToken.expires < new Date())
      return { success: false, error: "Verification token has expired" }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return { success: true, message: "Email verified successfully" }
  } catch (error) {
    return { success: false, error: "Failed to verify email" }
  }
}

export async function resendVerificationAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) return { success: false, error: "User not found" }
    if (user.emailVerified)
      return { success: false, error: "Email already verified" }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 86400000)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    return { success: true, message: "Verification email sent" }
  } catch (error) {
    return { success: false, error: "Failed to resend verification email" }
  }
}
