import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/shared/mobile-menu"
import { LandingShowcase } from "@/components/shared/landing-showcase"
import { LandingFaq } from "@/components/shared/landing-faq"
import { EcgHeartbeat } from "@/components/shared/ecg-heartbeat"
import {
  ArrowRight,
  Activity,
  Calendar,
  Shield,
  Users,
  Stethoscope,
  ChartBar,
  FileText,
  CreditCard,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
  Globe,
  Headphones,
} from "lucide-react"

const ecgSvg = fs.readFileSync(path.join(process.cwd(), "public", "heartbeat-ecg.svg"), "utf8")

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Online appointment booking with automated SMS/email reminders, calendar sync, and multi-provider coordination to eliminate double-bookings.",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400"
  },
  {
    icon: FileText,
    title: "Electronic Health Records",
    description: "HIPAA-compliant patient charts with comprehensive medical history, vitals tracking, allergy reports, and electronic prescriptions.",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: CreditCard,
    title: "Automated Billing",
    description: "Streamline invoicing, online payments, and insurance claims with instant status tracking and detailed financial analytics.",
    color: "from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400"
  },
  {
    icon: Users,
    title: "Patient Portal",
    description: "Secure space for patients to view medical history, self-schedule appointments, and communicate directly with providers.",
    color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400"
  },
  {
    icon: Stethoscope,
    title: "Provider Analytics",
    description: "Manage doctor shifts, track utilization rates, and coordinate multi-specialty teams across multiple clinic locations.",
    color: "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400"
  },
  {
    icon: ChartBar,
    title: "Practice Reports",
    description: "Unlock actionable insights into financial health, patient demographics, and clinic performance with real-time dashboards.",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400"
  }
]

const stats = [
  { label: "Active Clinics", value: "2,500+" },
  { label: "Patients Managed", value: "1.2M+" },
  { label: "Appointments Booked", value: "15M+" },
  { label: "Uptime SLA", value: "99.99%" }
]

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Medical Director, HealthFirst Clinic",
    content: "ClinicPro transformed our practice. We reduced no-shows by 40% and our billing cycle is now 3x faster. The EHR integration is seamless.",
    avatar: "SC"
  },
  {
    name: "Dr. James Rodriguez",
    role: "Owner, Family Care Center",
    content: "The best investment we made for our clinic. Patient satisfaction scores went up 25% since we switched to ClinicPro's patient portal.",
    avatar: "JR"
  },
  {
    name: "Maria Thompson",
    role: "Practice Manager, Wellness Group",
    content: "Finally, a system that actually works for multi-location practices. The analytics dashboard gives me real-time insights across all our clinics.",
    avatar: "MT"
  }
]

const trustLogos = [
  { name: "HIPAA", icon: Shield },
  { name: "SOC2", icon: Lock },
  { name: "GDPR", icon: Globe },
  { name: "24/7 Support", icon: Headphones },
  { name: "99.99% Uptime", icon: Zap }
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* HEADER NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Stethoscope className="h-8 w-8 text-primary group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">ClinicPro</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#showcase" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Showcase</Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-medium shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32">
          {/* Background image */}
          <div className="absolute inset-0 -z-20">
            <img
              src="/hero-bg.jpg"
              alt=""
              className="h-full w-full object-cover"
              suppressHydrationWarning
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-emerald-900/60 dark:from-blue-950/90 dark:via-indigo-950/85 dark:to-emerald-950/75" />
          </div>

          {/* Subtle overlay glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/15 blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[100px]" />
          </div>

          {/* ECG Heartbeat animation */}
          <div className="pointer-events-none absolute inset-0 -z-5 overflow-hidden flex items-center justify-center">
            <EcgHeartbeat svg={ecgSvg} interval={7} />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-20">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-300 animate-fade-in-up opacity-0">
                  <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-spin-slow" />
                  Now Version 2.0 Early Access
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance leading-[1.1] animate-fade-in-up delay-200 opacity-0">
                  Modern Clinic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">Management</span> for Healthcare Teams
                </h1>
                <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-blue-100/80 text-balance animate-fade-in-up delay-300 opacity-0">
                  Streamline operations, automate patient workflows, and secure medical charts in a single, high-performance platform. Engineered for speed, compliance, and clinical ease.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4 animate-fade-in-up delay-400 opacity-0">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
                      Start 14-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] shadow-lg shadow-white/5 transition-all duration-300">
                      Explore Features <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-2 pt-6 text-xs font-medium text-blue-100/70 animate-fade-in-up delay-500 opacity-0">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> HIPAA Compliant</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Credit Card Required</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Setup in 5 Minutes</span>
                </div>
              </div>

              {/* HERO VISUAL — Floating Feature Cards */}
              <div className="lg:col-span-5 relative hidden sm:block">
                <div className="relative mx-auto max-w-[500px] lg:max-w-none h-[350px] sm:h-[420px] lg:h-[460px]">
                  {/* Floating feature cards */}
                  <div className="absolute top-8 left-4" style={{ animation: 'float-card-1 6s ease-in-out infinite' }}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-110 hover:shadow-[0_12px_40px_0_rgba(59,130,246,0.5)] hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">Smart Scheduling</span>
                          <span className="text-xs text-blue-100/70">Real-time availability</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-8 right-4" style={{ animation: 'float-card-2 6s ease-in-out infinite' }}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-110 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.5)] hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all duration-300">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">HIPAA Compliant</span>
                          <span className="text-xs text-emerald-100/70">100% secure</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-4" style={{ animation: 'float-card-3 6s ease-in-out infinite' }}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-110 hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.5)] hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300">
                          <ChartBar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">Analytics</span>
                          <span className="text-xs text-purple-100/70">Real-time insights</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-4" style={{ animation: 'float-card-4 6s ease-in-out infinite' }}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-110 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.5)] hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:shadow-amber-500/50 transition-all duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">Multi-user</span>
                          <span className="text-xs text-amber-100/70">Team collaboration</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center badge */}
                  <div className="absolute top-1/2 left-1/2 z-10" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Stethoscope className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold block leading-tight text-white">ClinicPro</span>
                        <span className="text-sm text-blue-100/70">Unified Healthcare Platform</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-border/40 bg-muted/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
              {trustLogos.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20 sm:py-28 relative">
          <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px] -z-10" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Heart className="h-3 w-3 fill-emerald-500" />
                Designed For Patient Care
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                All-in-One Infrastructure for Modern Practices
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Ditch the fragmented tools. ClinicPro integrates appointments, records, billing, and communication into a single, cohesive medical workspace.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="glass-card group relative overflow-hidden p-6 sm:p-8 border border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{feature.title}</h3>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW — From Stitch Design */}
        <section className="py-20 sm:py-28 border-t border-border/40 bg-muted/10 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 space-y-6">
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Activity className="h-3 w-3" />
                  Unified Command Center
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Monitor Every Aspect of Your Clinic
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Gain insights into patient flow, staff performance, and financial health in real-time from a single, intuitive interface.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-foreground text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    Real-time analytics dashboard
                  </li>
                  <li className="flex items-center gap-3 text-foreground text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    Intelligent inventory tracking
                  </li>
                  <li className="flex items-center gap-3 text-foreground text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    EHR/EMR seamless synchronization
                  </li>
                </ul>
                <Link href="/register" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all">
                  Explore the Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="lg:col-span-3 relative">
                <div className="relative animate-float-slow">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 rounded-xl blur-2xl" />
                  <div className="relative bg-card rounded-xl shadow-2xl border border-border/40 overflow-hidden">
                    <div className="h-8 bg-muted/50 border-b border-border/40 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/40" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
                      <div className="w-3 h-3 rounded-full bg-green-400/40" />
                    </div>
                    <div className="p-6 space-y-4">
                      {/* Mini Dashboard Header */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold">Dashboard Overview</p>
                          <p className="text-xs text-muted-foreground">Monday, May 22, 2024</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">ONLINE</span>
                        </div>
                      </div>
                      {/* Mini Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Patients</p>
                          <p className="text-lg font-bold">1,284</p>
                          <span className="text-[10px] text-emerald-500">+12%</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Today</p>
                          <p className="text-lg font-bold">08</p>
                          <span className="text-[10px] text-muted-foreground">2 done</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Revenue</p>
                          <p className="text-lg font-bold">$24.8K</p>
                          <span className="text-[10px] text-emerald-500">+5%</span>
                        </div>
                      </div>
                      {/* Mini Chart */}
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Weekly Volume</p>
                        <div className="h-16 flex items-end justify-between gap-1">
                          {[40, 60, 85, 95, 50, 30, 20].map((h, i) => (
                            <div key={i} className={`w-full rounded-t-sm ${i === 3 ? 'bg-blue-600' : 'bg-muted-foreground/20'}`} style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SHOWCASE */}
        <section id="showcase" className="py-20 sm:py-28 border-t border-border/40 bg-muted/10 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Interactive Walkthrough</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                See ClinicPro in Action
              </h2>
              <p className="text-base text-muted-foreground">
                Select a tab below to preview different screens, workflows, and modules built for medical practitioners.
              </p>
            </div>
            <LandingShowcase />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-20 sm:py-28 border-t border-border/40 relative">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] -z-10" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3" />
                Trusted by 2,500+ Clinics
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What Healthcare Leaders Say
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Join thousands of healthcare professionals who trust ClinicPro to manage their practice.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 sm:p-8 border border-border/40 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="py-16 sm:py-24 border-t border-border/40 relative overflow-hidden bg-background">
          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px] -z-10" />
          <div className="pointer-events-none absolute -top-40 left-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-[100px] -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="glass-card border border-border/40 rounded-2xl p-6 sm:p-12 lg:p-16 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-emerald-500/[0.02] grid gap-8 sm:gap-12 lg:grid-cols-2 items-center shadow-xl">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  Enterprise Security
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Bank-Grade Encryption & Regulatory Compliance
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  We build our software with safety as the primary pillar. All communications, clinical notes, and financial claims are fully encrypted with security measures designed to fit HIPAA and international requirements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                    <h4 className="text-xs font-bold">256-Bit SSL Encryption</h4>
                    <p className="text-[11px] text-muted-foreground">Data is fully secured both in transit and at rest.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
                    <h4 className="text-xs font-bold">HIPAA Compliant</h4>
                    <p className="text-[11px] text-muted-foreground">Certified data hosting and BAA agreements available.</p>
                  </div>
                </div>
              </div>
              <div className="relative border border-border/40 rounded-xl p-4 sm:p-6 bg-background space-y-3 sm:space-y-4 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold border-b pb-3">
                  <Activity className="h-4 w-4 text-blue-500 animate-pulse-soft" />
                  <span>Real-Time Compliance Audit Logs</span>
                </div>
                <div className="space-y-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                  <div className="p-2 bg-muted/40 rounded border border-border/20 flex items-center justify-between gap-2">
                    <span className="min-w-0 break-all line-clamp-2">[09:30:14] DR. GREEN ACCESSED #EV-2847 EHR</span>
                    <span className="text-emerald-500 font-bold shrink-0 text-[9px]">SECURE</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border/20 flex items-center justify-between gap-2">
                    <span className="min-w-0 break-all line-clamp-2">[09:45:02] INV-2834 DISPATCHED VIA API</span>
                    <span className="text-emerald-500 font-bold shrink-0 text-[9px]">SECURE</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border/20 flex items-center justify-between gap-2">
                    <span className="min-w-0 break-all line-clamp-2">[10:15:33] SYSTEM DAILY BACKUP COMPLETE</span>
                    <span className="text-emerald-500 font-bold shrink-0 text-[9px]">SUCCESS</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border/20 flex items-center justify-between gap-2">
                    <span className="min-w-0 break-all line-clamp-2">[10:30:00] SECURITY AUDIT: NO FAULTS FOUND</span>
                    <span className="text-emerald-500 font-bold shrink-0 text-[9px]">COMPLIANT</span>
                  </div>
                </div>
                <div className="text-[11px] text-center text-muted-foreground">
                  Our system records detailed access logs, tracking every patient chart view for complete accountability.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 sm:py-28 border-t border-border/40 bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Got Questions?</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-muted-foreground">
                Everything you need to know about starting your journey with ClinicPro.
              </p>
            </div>
            <LandingFaq />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white dark:from-background dark:to-background">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04] dark:opacity-[0.08]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Transform Your Clinic Operations Today
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 dark:text-muted-foreground text-balance">
              Join thousands of physicians and healthcare administrators who rely on ClinicPro to handle schedules, files, bills, and communications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] shadow-lg shadow-white/5 transition-all duration-300">
                  Sign In to Account
                </Button>
              </Link>
            </div>
            <p className="text-xs text-slate-400 dark:text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5 lg:gap-12">
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-lg font-bold">ClinicPro</span>
              </Link>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                ClinicPro provides a unified, secure web ecosystem built specifically for modern clinic groups, single-provider offices, and telehealth teams.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Product</h4>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#showcase" className="hover:text-foreground transition-colors">Interactive Demo</Link></li>
                <li><Link href="#security" className="hover:text-foreground transition-colors">Compliance Security</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Company</h4>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal</h4>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">HIPAA Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/30 pt-8 gap-4">
            <p className="text-xs text-muted-foreground">&copy; 2026 ClinicPro. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span>GDPR Certified</span>
              <span>&bull;</span>
              <span>HIPAA Compliant</span>
              <span>&bull;</span>
              <span>SOC2 Secure</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Micro-interactions Script */}
      <script
        dangerouslySetInnerHTML={{ __html: `
          (function() {
            // === Scroll Reveal Animation ===
            var revealObserver = new IntersectionObserver(function(entries) {
              entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                  entry.target.style.opacity = '1';
                  entry.target.style.transform = 'translateY(0)';
                }
              });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-on-scroll').forEach(function(el) {
              revealObserver.observe(el);
            });

            // === Micro-interactions ===
            document.querySelectorAll('a, button').forEach(function(el) {
              el.addEventListener('mousedown', function() { el.classList.add('scale-95'); });
              el.addEventListener('mouseup', function() { el.classList.remove('scale-95'); });
              el.addEventListener('mouseleave', function() { el.classList.remove('scale-95'); });
            });
          })();
        `}}
      />
    </div>
  )
}
