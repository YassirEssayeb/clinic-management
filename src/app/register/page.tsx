"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { toast } from "sonner"
import { Stethoscope } from "lucide-react"
import { registerAction } from "@/actions/auth.actions"

export default function RegisterPage() {
  const router = useRouter()

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await registerAction({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
        role: formData.get("role") as "PATIENT" | "DOCTOR" | "RECEPTIONIST" | undefined,
      })

      if (result.success) {
        toast.success("Account created! You can now sign in.")
        router.push("/login")
      } else {
        toast.error(result.error)
      }

      return result
    },
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 px-4 py-10">
      <div className="w-full max-w-md border border-border rounded-xl bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">ClinicPro</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below to get started.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
