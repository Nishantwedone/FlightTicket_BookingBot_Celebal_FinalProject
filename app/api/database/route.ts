import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const mockDatabaseStatus = {
      status: "connected",
      database: "flight_booking_bot",
      tables: [
        "airlines",
        "airports",
        "flights",
        "flight_classes",
        "passengers",
        "bookings",
        "chat_sessions",
        "chat_messages",
        "user_preferences",
      ],
      totalRecords: {
        airlines: 10,
        airports: 17,
        flights: 10,
        flight_classes: 24,
        passengers: 5,
        bookings: 5,
        chat_sessions: 3,
        chat_messages: 6,
        user_preferences: 3,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(mockDatabaseStatus)
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
