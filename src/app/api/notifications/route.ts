import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ notifications })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const notification = await prisma.notification.create({
    data: {
      userId: body.userId || session.user.id,
      title: body.title,
      message: body.message,
      type: body.type || "INFO",
    },
  })

  return NextResponse.json({ notification })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    })
    return NextResponse.json({ success: true })
  }

  if (body.id) {
    const notification = await prisma.notification.update({
      where: { id: body.id },
      data: { read: true },
    })
    return NextResponse.json({ notification })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
