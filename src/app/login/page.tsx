"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { toast } from "sonner"
import { Stethoscope } from "lucide-react"
import { loginAction } from "@/actions/auth.actions"

export default function LoginPage() {
  const router = useRouter()

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await loginAction({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      })

      if (result.success) {
        toast.success("Welcome back!")
        const role = result.role
        if (role === "ADMIN") router.push("/admin")
        else if (role === "DOCTOR") router.push("/doctor")
        else if (role === "RECEPTIONIST") router.push("/receptionist")
        else router.push("/patient")
      } else {
        toast.error(result.error)
      }

      return result
    },
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 px-4">
      <div className="w-full max-w-md border border-border rounded-xl bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">ClinicPro</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Enter your credentials below.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
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

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
