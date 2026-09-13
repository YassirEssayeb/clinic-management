# ClinicPro - Clinic Management System

A full-stack clinic management platform built with Next.js 16, Prisma, MySQL, and NextAuth.

## Features

- **Admin Dashboard** - Full clinic management, reports, and settings
- **Doctor Portal** - Appointments, medical records, prescriptions
- **Patient Portal** - View records, appointments, invoices
- **Receptionist** - Patient registration, appointment scheduling

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Server Actions, NextAuth v5
- **Database:** MySQL + Prisma ORM
- **Auth:** NextAuth with credentials provider

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="mysql://user:password@localhost:3306/clinicpro"
AUTH_SECRET="your-secret-key-min-32-chars"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Production

```bash
npm run build
npm start
```
