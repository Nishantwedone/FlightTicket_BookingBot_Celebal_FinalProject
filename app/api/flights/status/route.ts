import { type NextRequest, NextResponse } from "next/server"

const flightStatuses = [
  { status: "On Time", delay: 0 },
  { status: "Delayed", delay: 15 },
  { status: "Delayed", delay: 30 },
  { status: "Boarding", delay: 0 },
  { status: "Departed", delay: 0 },
  { status: "Arrived", delay: 0 },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const flightNumber = searchParams.get("flightNumber")

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  const randomStatus = flightStatuses[Math.floor(Math.random() * flightStatuses.length)]

  const flightStatus = {
    flightNumber,
    status: randomStatus.status,
    delay: randomStatus.delay > 0 ? `${randomStatus.delay} minutes` : null,
    gate: `A${Math.floor(Math.random() * 30) + 1}`,
    terminal: Math.floor(Math.random() * 3) + 1,
    scheduledDeparture: "10:30 AM",
    actualDeparture:
      randomStatus.delay > 0
        ? `${10 + Math.floor(randomStatus.delay / 60)}:${30 + (randomStatus.delay % 60)} AM`
        : "10:30 AM",
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json({ flightStatus })
}
