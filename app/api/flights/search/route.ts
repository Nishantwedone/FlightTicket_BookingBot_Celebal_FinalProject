import { type NextRequest, NextResponse } from "next/server"

const airlines = [
  "American Airlines",
  "Delta Airlines",
  "United Airlines",
  "British Airways",
  "Lufthansa",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
]

const airports = {
  "New York": ["JFK", "LGA", "EWR"],
  London: ["LHR", "LGW", "STN"],
  Paris: ["CDG", "ORY"],
  Tokyo: ["NRT", "HND"],
  Dubai: ["DXB"],
  "Los Angeles": ["LAX"],
  Chicago: ["ORD", "MDW"],
  Miami: ["MIA"],
  Frankfurt: ["FRA"],
  Amsterdam: ["AMS"],
}

function generateFlightNumber(airline: string): string {
  const codes = {
    "American Airlines": "AA",
    "Delta Airlines": "DL",
    "United Airlines": "UA",
    "British Airways": "BA",
    Lufthansa: "LH",
    Emirates: "EK",
    "Qatar Airways": "QR",
    "Singapore Airlines": "SQ",
  }

  const code = codes[airline as keyof typeof codes] || "XX"
  const number = Math.floor(Math.random() * 9000) + 1000
  return `${code} ${number}`
}

function generatePrice(distance: number, flightClass: string): number {
  let basePrice = Math.floor(distance * 0.15) + Math.floor(Math.random() * 200) + 300

  switch (flightClass.toLowerCase()) {
    case "business":
      basePrice *= 3
      break
    case "first":
      basePrice *= 5
      break
    default:
      break
  }

  return Math.floor(basePrice)
}

function generateDuration(distance: number): string {
  const hours = Math.floor(distance / 500) + Math.floor(Math.random() * 3) + 1
  const minutes = Math.floor(Math.random() * 60)
  return `${hours}h ${minutes}m`
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, date, passengers = 1, class: flightClass = "economy" } = await request.json()

    if (!from || !to || !date) {
      return NextResponse.json({ error: "Missing required parameters: from, to, date" }, { status: 400 })
    }

    const distance = Math.floor(Math.random() * 5000) + 500
    const flights = []

    for (let i = 0; i < 5; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)]
      const departureAirports = airports[from as keyof typeof airports] || ["XXX"]
      const arrivalAirports = airports[to as keyof typeof airports] || ["YYY"]

      const departureTime = new Date(
        `${date}T${String(Math.floor(Math.random() * 20) + 4).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
      )
      const duration = generateDuration(distance)
      const durationHours = Number.parseInt(duration.split("h")[0])
      const durationMinutes = Number.parseInt(duration.split(" ")[1].split("m")[0])

      const arrivalTime = new Date(departureTime.getTime() + (durationHours * 60 + durationMinutes) * 60000)

      flights.push({
        id: `FL${String(i + 1).padStart(3, "0")}`,
        airline,
        flightNumber: generateFlightNumber(airline),
        departure: {
          airport: departureAirports[Math.floor(Math.random() * departureAirports.length)],
          city: from,
          time: departureTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: departureTime.toISOString().split("T")[0],
        },
        arrival: {
          airport: arrivalAirports[Math.floor(Math.random() * arrivalAirports.length)],
          city: to,
          time: arrivalTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: arrivalTime.toISOString().split("T")[0],
        },
        duration,
        price: generatePrice(distance, flightClass),
        class: flightClass.charAt(0).toUpperCase() + flightClass.slice(1),
        stops: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
        available: Math.random() > 0.1,
      })
    }

    flights.sort((a, b) => a.price - b.price)

    return NextResponse.json({ flights })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
