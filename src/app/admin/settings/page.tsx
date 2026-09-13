"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (data.user) toast.success("Profile updated")
      else toast.error(data.error || "Failed")
    } catch {
      toast.error("Failed to update profile")
    }
    setSaving(false)
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) { toast.error("Fill in both fields"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) { toast.success("Password changed"); setCurrentPassword(""); setNewPassword("") }
      else toast.error(data.error || "Failed")
    } catch {
      toast.error("Failed to change password")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Settings</h1>

      <div className="bg-white border border-[#c3c6d5] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Profile Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone" />
        </div>
        <Button onClick={handleProfileUpdate} disabled={saving} className="mt-4">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <Button onClick={handlePasswordChange} disabled={saving} className="mt-4">
          {saving ? "Changing..." : "Change Password"}
        </Button>
      </div>
    </div>
  )
}
