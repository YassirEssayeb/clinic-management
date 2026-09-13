"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => { setProfile(data.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-6"><h1 className="text-2xl font-semibold text-[#111c2d]">Profile</h1><div className="bg-white border border-[#c3c6d5] rounded-xl p-6 animate-pulse h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Profile</h1>

      <div className="bg-white border border-[#c3c6d5] rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-20 w-20 rounded-full bg-[#003c90] flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#111c2d]">{profile?.name}</h2>
            <p className="text-sm text-[#434653]">{profile?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#003c90]/10 text-[#003c90]">{profile?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Phone</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.phone ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Email</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Role</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.role}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Member Since</p>
            <p className="text-sm text-[#111c2d] mt-1">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
