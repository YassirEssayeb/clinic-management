"use client"

import Link from "next/link"
import { useActionState } from "react"
import { toast } from "sonner"
import { Stethoscope, CheckCircle2 } from "lucide-react"
import { forgotPasswordAction } from "@/actions/auth.actions"

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await forgotPasswordAction({
        email: formData.get("email") as string,
      })

      if (result.success) {
        toast.success(result.message)
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
          <h1 className="text-xl font-semibold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {state?.success ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Link
              href="/login"
              className="mt-6 text-sm text-primary font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {pending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
