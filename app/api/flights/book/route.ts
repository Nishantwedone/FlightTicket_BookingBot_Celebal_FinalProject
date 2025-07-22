import { type NextRequest, NextResponse } from "next/server"

interface BookingData {
  flightId: string
  passengerName: string
  email?: string
  phone?: string
  departure: string
  arrival: string
  date: string
  flightNumber: string
  price: number
}

const bookings: any[] = []

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()
    const { flightId, passengerName, email, phone, departure, arrival, date, flightNumber, price } = bookingData

    if (!flightId || !passengerName) {
      return NextResponse.json({ error: "Missing required fields: flightId and passengerName" }, { status: 400 })
    }

    const bookingId = `BK${Date.now().toString().slice(-8)}`

    const booking = {
      bookingId,
      flightId,
      flightNumber: flightNumber || `6E${Math.floor(Math.random() * 9000) + 1000}`,
      passenger: passengerName,
      departure: departure || "Unknown",
      arrival: arrival || "Unknown",
      date: date || new Date().toISOString().split("T")[0],
      price: price || Math.floor(Math.random() * 5000) + 3000,
      status: "Confirmed",
      email,
      phone,
      bookingDate: new Date().toISOString(),
      paymentStatus: "Completed",
    }

    bookings.push(booking)

    // Send email notification
    if (email) {
      try {
        await fetch("/api/notifications/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: `Flight Booking Confirmation - ${bookingId}`,
            bookingDetails: booking,
          }),
        })
      } catch (error) {
        console.error("Failed to send email notification:", error)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      booking,
      message: "Flight booked successfully!",
    })
  } catch (error) {
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")

  if (bookingId) {
    const booking = bookings.find((b) => b.bookingId === bookingId)
    if (booking) {
      return NextResponse.json({ booking })
    } else {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
  }

  return NextResponse.json({ bookings })
}
