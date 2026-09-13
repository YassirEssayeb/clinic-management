"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, Suspense } from "react"
import { toast } from "sonner"
import { Stethoscope, CheckCircle2 } from "lucide-react"
import { resetPasswordAction } from "@/actions/auth.actions"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await resetPasswordAction({
        token,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
      })

      if (result.success) {
        toast.success(result.message)
        router.push("/login")
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
          <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your new password below.
          </p>
        </div>

        {!token ? (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">
              Invalid reset link. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block text-sm text-primary font-medium hover:underline"
            >
              Request new link
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                New Password
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

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {pending ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
