import { type NextRequest, NextResponse } from "next/server"

interface NotificationRequest {
  type: "booking_confirmation" | "flight_update" | "payment_receipt" | "reminder"
  recipient: string
  bookingId?: string
  flightNumber?: string
  message: string
}

const notifications: any[] = []

export async function POST(request: NextRequest) {
  try {
    const notificationData: NotificationRequest = await request.json()

    const notification = {
      id: `NOTIF${Date.now()}`,
      ...notificationData,
      status: "sent",
      sentAt: new Date().toISOString(),
    }

    notifications.push(notification)

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      message: "Notification sent successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ notifications })
}
