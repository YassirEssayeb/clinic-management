"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden p-2 -mr-2" aria-label="Open menu">
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="absolute inset-y-0 right-0 w-[280px] bg-background border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">ClinicPro</span>
              </Link>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="flex flex-col gap-1">
                {[
                  { href: "#features", label: "Features" },
                  { href: "#showcase", label: "Showcase" },
                  { href: "#testimonials", label: "Testimonials" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="px-4 pb-6 pt-4 border-t border-border space-y-3">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-medium">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
