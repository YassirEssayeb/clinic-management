"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  FileText,
  CreditCard,
  ChartBar,
  CheckCircle2,
  Plus,
  TrendingUp
} from "lucide-react"

const tabs = [
  { id: "calendar", label: "Smart Calendar", icon: Calendar },
  { id: "ehr", label: "Patient EHR Charts", icon: FileText },
  { id: "billing", label: "Smart Billing", icon: CreditCard },
  { id: "analytics", label: "Practice Insights", icon: ChartBar }
]

export function LandingShowcase() {
  const [activeShowcase, setActiveShowcase] = useState<string>("calendar")

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveShowcase(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-300 ${
              activeShowcase === tab.id
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                : "bg-background border-border hover:border-muted-foreground hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card border border-border/40 overflow-hidden rounded-2xl shadow-xl bg-background/50">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="font-semibold capitalize">{activeShowcase} Module</span>
          </div>
          <span>Secured HIPAA Tunnel Active</span>
        </div>
        <div className="p-4 sm:p-8 min-h-[300px] sm:min-h-[400px]">
          {activeShowcase === "calendar" && <CalendarView />}
          {activeShowcase === "ehr" && <EhrView />}
          {activeShowcase === "billing" && <BillingView />}
          {activeShowcase === "analytics" && <AnalyticsView />}
        </div>
      </div>
    </div>
  )
}

function CalendarView() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-4">
        <h4 className="text-base font-bold text-foreground">Advanced Calendar Scheduling</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Drag-and-drop bookings, customize practitioner shifts, configure holiday schedules, and block emergency times instantly. Color-code visits by department or consultation type.
        </p>
        <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated Reminder Dispatch</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-Practitioner Sync</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Patient Self-Schedule API</li>
        </ul>
      </div>
      <div className="md:col-span-8 border border-border/40 rounded-xl p-4 sm:p-6 bg-background space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm font-bold">Weekly Schedule (July 2026)</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px]">Prev</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px]">Next</Button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] font-bold border-b pb-2">
          {["Mon 06", "Tue 07", "Wed 08", "Thu 09", "Fri 10"].map((day, i) => (
            <div key={i} className="text-muted-foreground">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2 min-h-[160px] text-[9px]">
          {[
            [
              { title: "E. Vance (Cardio)", time: "09:00 AM", doctor: "Dr. Green", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
              { title: "R. Miller (Physio)", time: "11:30 AM", doctor: "Dr. Diaz", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" }
            ],
            [
              { title: "M. Brody (Pediat)", time: "10:15 AM", doctor: "Dr. Grant", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" }
            ],
            [
              { title: "S. Plath (Checkup)", time: "11:00 AM", doctor: "Dr. Green", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
              { title: "J. Doe (Consult)", time: "02:30 PM", doctor: "Dr. Alan", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
            ],
            [
              { title: "T. Stark (Orthop)", time: "09:00 AM", doctor: "Dr. Green", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" }
            ],
            [
              { title: "A. Lovelace (EHR)", time: "01:00 PM", doctor: "Dr. Diaz", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" }
            ]
          ].map((dayEvents, i) => (
            <div key={i} className="space-y-1.5 border-r last:border-0 pr-1">
              {dayEvents.map((evt, j) => (
                <div key={j} className={`p-1.5 rounded border ${evt.color} leading-snug cursor-pointer hover:opacity-80 transition-opacity`}>
                  <span className="font-bold block truncate">{evt.title}</span>
                  <span className="text-[8px] font-semibold opacity-80">{evt.time}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EhrView() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-4">
        <h4 className="text-base font-bold text-foreground">Secure Electronic Charts</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Say goodbye to paper files. ClinicPro provides unified digital medical charts with immediate access to clinical summaries, prescription templates, lab results, and diagnostic imaging uploads.
        </p>
        <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Digital e-Prescribing (eRx)</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Lab result integration</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Audit logs for compliance</li>
        </ul>
      </div>
      <div className="md:col-span-8 border border-border/40 rounded-xl p-4 sm:p-6 bg-background space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">EV</div>
            <div>
              <span className="text-xs font-bold block">Eleanor Vance (Patient Profile)</span>
              <span className="text-[9px] text-muted-foreground">DOB: Nov 12, 1989 (36 yrs) • Female • ID: #EV-2847</span>
            </div>
          </div>
          <Badge className="text-[9px] border-emerald-500/30 bg-emerald-500/5 text-emerald-500 border">Record Active</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
          <div className="border border-border/40 p-2.5 rounded-lg space-y-1 bg-muted/20">
            <span className="font-bold text-muted-foreground block text-[9px] uppercase">Allergies</span>
            <span className="font-semibold text-rose-500 block">• Penicillin (Severe)</span>
            <span className="font-semibold text-rose-500 block">• Shellfish (Mild)</span>
          </div>
          <div className="border border-border/40 p-2.5 rounded-lg space-y-1 bg-muted/20">
            <span className="font-bold text-muted-foreground block text-[9px] uppercase">Active Vitals</span>
            <span className="block font-semibold">BP: 120/80 mmHg</span>
            <span className="block font-semibold">Heart Rate: 72 bpm</span>
          </div>
          <div className="border border-border/40 p-2.5 rounded-lg space-y-1 bg-muted/20">
            <span className="font-bold text-muted-foreground block text-[9px] uppercase">Medications</span>
            <span className="block font-semibold">• Lisinopril 10mg QD</span>
            <span className="block font-semibold">• Atorvastatin 20mg</span>
          </div>
        </div>
        <div className="space-y-1.5 text-[10px]">
          <span className="font-bold text-muted-foreground block">Clinical Encounter Notes (July 02, 2026)</span>
          <div className="p-3 rounded-lg border border-border/40 bg-muted/10 italic text-muted-foreground leading-relaxed">
            &quot;Patient complains of mild chest tightness during morning exercise. EKG was performed and showed normal sinus rhythm. Advised to reduce sodium intake and monitor daily blood pressure.&quot;
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingView() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-4">
        <h4 className="text-base font-bold text-foreground">Smart Billing and Insurance</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Automate clinic invoicing. Create bills directly from appointment records, process credit card payments via Stripe, and submit electronic claims with automatic validation.
        </p>
        <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Stripe Terminal & Web Integration</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated Insurance Invoicing</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-Currency Financial Reports</li>
        </ul>
      </div>
      <div className="md:col-span-8 border border-border/40 rounded-xl p-4 sm:p-6 bg-background space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <span className="text-xs font-bold">Billing Dashboard & Invoices</span>
          <Button size="sm" className="h-7 text-[10px] bg-blue-600 text-white w-fit"><Plus className="h-3 w-3 mr-1" /> New Invoice</Button>
        </div>
        <div className="space-y-2 text-[10px]">
          {[
            { id: "INV-2834", patient: "Marcus Brody", date: "Jul 05, 2026", amount: "$180.00", status: "Paid", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
            { id: "INV-2835", patient: "Sylvia Plath", date: "Jul 05, 2026", amount: "$350.00", status: "Pending", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
            { id: "INV-2836", patient: "Eleanor Vance", date: "Jul 04, 2026", amount: "$95.00", status: "Paid", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
            { id: "INV-2837", patient: "Frank Sinatra", date: "Jul 02, 2026", amount: "$450.00", status: "Overdue", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" }
          ].map((inv, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/10 hover:bg-muted/30 transition-colors gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inv.id}</span>
                <div>
                  <span className="font-bold block">{inv.patient}</span>
                  <span className="text-[8px] text-muted-foreground">{inv.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:justify-end">
                <span className="font-bold">{inv.amount}</span>
                <span className={`px-2 py-0.5 rounded border text-[8px] font-extrabold ${inv.badge}`}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsView() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-4">
        <h4 className="text-base font-bold text-foreground">Clinic Performance Insights</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Access real-time reports regarding revenue, patient demographic distributions, appointment cancellation rates, and physician utilization metrics. Take data-driven business decisions.
        </p>
        <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Revenue & Receivables Forecast</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Patient Growth Graphs</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Exportable PDFs & CSV Data</li>
        </ul>
      </div>
      <div className="md:col-span-8 border border-border/40 rounded-xl p-4 sm:p-6 bg-background space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold">Monthly Patient Growth (Jan - Jun)</span>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> +24% Growth</span>
        </div>
        <div className="relative h-40 border rounded-lg bg-muted/10 flex items-end p-4 gap-3 sm:gap-6 justify-center overflow-hidden">
          <div className="absolute inset-0 grid grid-rows-4 p-4 pointer-events-none opacity-5">
            {[1, 2, 3, 4].map(k => <div key={k} className="border-b last:border-0" />)}
          </div>
          {[
            { month: "Jan", height: "40%", value: "820" },
            { month: "Feb", height: "55%", value: "1,140" },
            { month: "Mar", height: "45%", value: "980" },
            { month: "Apr", height: "70%", value: "1,450" },
            { month: "May", height: "85%", value: "1,820" },
            { month: "Jun", height: "95%", value: "2,100" }
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer w-8">
              <span className="text-[8px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}</span>
              <div className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-emerald-500 group-hover:brightness-110 transition-all" style={{ height: bar.height }} />
              <span className="text-[9px] font-semibold text-muted-foreground">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
