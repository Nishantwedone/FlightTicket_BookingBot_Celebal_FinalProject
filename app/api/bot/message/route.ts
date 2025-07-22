import { type NextRequest, NextResponse } from "next/server"

interface FlightSearchParams {
  from?: string
  to?: string
  date?: string
  passengers?: number
  class?: string
}

const indianCities = {
  delhi: ["DEL", "Delhi", "New Delhi", "दिल्ली", "नई दिल्ली", "Delhi", "Nueva Delhi"],
  mumbai: ["BOM", "Mumbai", "Bombay", "मुंबई", "बॉम्बे", "Bombay", "Bombay"],
  bangalore: ["BLR", "Bangalore", "Bengaluru", "बैंगलोर", "बेंगलुरु", "Bangalore", "Bangalore"],
  chennai: ["MAA", "Chennai", "Madras", "चेन्नई", "मद्रास", "Chennai", "Chennai"],
  kolkata: ["CCU", "Kolkata", "Calcutta", "कोलकाता", "कलकत्ता", "Calcuta", "Calcuta"],
  hyderabad: ["HYD", "Hyderabad", "हैदराबाद", "Hyderabad", "Hyderabad"],
  pune: ["PNQ", "Pune", "पुणे", "Pune", "Pune"],
  ahmedabad: ["AMD", "Ahmedabad", "अहमदाबाद", "Ahmedabad", "Ahmedabad"],
  jaipur: ["JAI", "Jaipur", "जयपुर", "Jaipur", "Jaipur"],
  goa: ["GOI", "Goa", "Panaji", "गोवा", "पणजी", "Goa", "Goa"],
  kochi: ["COK", "Kochi", "Cochin", "कोच्चि", "कोचीन", "Kochi", "Kochi"],
  lucknow: ["LKO", "Lucknow", "लखनऊ", "Lucknow", "Lucknow"],
  chandigarh: ["IXC", "Chandigarh", "चंडीगढ़", "Chandigarh", "Chandigarh"],
  bhubaneswar: ["BBI", "Bhubaneswar", "भुवनेश्वर", "Bhubaneswar", "Bhubaneswar"],
  indore: ["IDR", "Indore", "इंदौर", "Indore", "Indore"],
  coimbatore: ["CJB", "Coimbatore", "कोयंबटूर", "Coimbatore", "Coimbatore"],
  nagpur: ["NAG", "Nagpur", "नागपुर", "Nagpur", "Nagpur"],
  vadodara: ["BDQ", "Vadodara", "वडोदरा", "Vadodara", "Vadodara"],
  srinagar: ["SXR", "Srinagar", "श्रीनगर", "Srinagar", "Srinagar"],
  thiruvananthapuram: [
    "TRV",
    "Thiruvananthapuram",
    "Trivandrum",
    "तिरुवनंतपुरम",
    "त्रिवेंद्रम",
    "Thiruvananthapuram",
    "Trivandrum",
  ],
}

const airlines = [
  { name: "IndiGo", code: "6E" },
  { name: "Air India", code: "AI" },
  { name: "SpiceJet", code: "SG" },
  { name: "Vistara", code: "UK" },
  { name: "GoAir", code: "G8" },
  { name: "AirAsia India", code: "I5" },
  { name: "Alliance Air", code: "9I" },
]

function findCityMatch(input: string): string | null {
  if (!input) return null

  const inputLower = input.toLowerCase()
  for (const [city, variants] of Object.entries(indianCities)) {
    if (variants.some((variant) => inputLower.includes(variant.toLowerCase()))) {
      return city
    }
  }
  return null
}

function extractFlightInfo(message: string): FlightSearchParams {
  const params: FlightSearchParams = {}
  const messageLower = message.toLowerCase()

  // First try to extract with specific patterns
  const fromToPattern = /(?:from|departing|leaving)\s+([a-zA-Z\s]+)\s+(?:to|for|towards)\s+([a-zA-Z\s]+)/i
  const fromToMatch = message.match(fromToPattern)

  if (fromToMatch) {
    const fromCity = findCityMatch(fromToMatch[1].trim())
    const toCity = findCityMatch(fromToMatch[2].trim())

    if (fromCity) params.from = fromCity
    if (toCity) params.to = toCity
  }

  // If the specific pattern didn't work, try individual patterns
  if (!params.from) {
    const fromPatterns = [
      /from\s+([a-zA-Z\s]+?)(?:\s+to|\s+$)/i,
      /leaving\s+([a-zA-Z\s]+?)(?:\s+to|\s+$)/i,
      /departing\s+([a-zA-Z\s]+?)(?:\s+to|\s+$)/i,
    ]

    for (const pattern of fromPatterns) {
      const match = message.match(pattern)
      if (match) {
        const cityMatch = findCityMatch(match[1].trim())
        if (cityMatch) {
          params.from = cityMatch
          break
        }
      }
    }
  }

  if (!params.to) {
    const toPatterns = [
      /to\s+([a-zA-Z\s]+?)(?:\s+on|\s+tomorrow|\s+today|\s+$)/i,
      /going\s+to\s+([a-zA-Z\s]+?)(?:\s+on|\s+tomorrow|\s+today|\s+$)/i,
      /flying\s+to\s+([a-zA-Z\s]+?)(?:\s+on|\s+tomorrow|\s+today|\s+$)/i,
    ]

    for (const pattern of toPatterns) {
      const match = message.match(pattern)
      if (match) {
        const cityMatch = findCityMatch(match[1].trim())
        if (cityMatch) {
          params.to = cityMatch
          break
        }
      }
    }
  }

  // Extract date information with improved pattern matching
  const datePatterns = [
    /(?:on|date)\s+([a-zA-Z0-9\s,]+)/i,
    /tomorrow/i,
    /today/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/i,
    /\d{1,2}(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s+\d{4})?/i,
    /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/i,
    /\d{1,2}\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
  ]

  // Specific pattern for dates like "27 July" or "July 27"
  const specificDatePattern =
    /(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i
  const specificDateMatch = message.match(specificDatePattern)

  if (specificDateMatch) {
    const day = specificDateMatch[1] || specificDateMatch[3]
    const month = specificDateMatch[2] || specificDateMatch[1]
    const year = new Date().getFullYear()

    const monthMap: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    }

    const monthIndex = monthMap[month.toLowerCase()]
    if (monthIndex !== undefined && day) {
      const date = new Date(year, monthIndex, Number.parseInt(day))
      params.date = date.toISOString().split("T")[0]
    }
  } else {
    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        if (match[0].toLowerCase().includes("tomorrow")) {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          params.date = tomorrow.toISOString().split("T")[0]
        } else if (match[0].toLowerCase().includes("today")) {
          params.date = new Date().toISOString().split("T")[0]
        } else if (
          match[1] &&
          /january|february|march|april|may|june|july|august|september|october|november|december/i.test(match[1])
        ) {
          // Handle month name formats
          const dateStr = match[0].trim()
          const currentYear = new Date().getFullYear()

          // Add year if not present
          const dateWithYear = dateStr.includes(currentYear.toString()) ? dateStr : `${dateStr}, ${currentYear}`

          const parsedDate = new Date(dateWithYear)
          if (!isNaN(parsedDate.getTime())) {
            params.date = parsedDate.toISOString().split("T")[0]
          } else {
            params.date = match[0].trim()
          }
        } else {
          params.date = match[0].trim()
        }
        break
      }
    }
  }

  const passengersMatch = message.match(/(\d+)\s+(?:passenger|person|people|traveler)/i)
  if (passengersMatch) {
    params.passengers = Number.parseInt(passengersMatch[1])
  }

  const classMatch = message.match(/(economy|business|first)\s*class/i)
  if (classMatch) {
    params.class = classMatch[1].toLowerCase()
  }

  return params
}

function generateFlights(from: string, to: string, date: string): any[] {
  const flights = []
  const fromCity = indianCities[from as keyof typeof indianCities]
  const toCity = indianCities[to as keyof typeof indianCities]

  if (!fromCity || !toCity) return []

  // Format date for display
  let displayDate = date
  let dateObj = new Date()

  try {
    dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      displayDate = dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    }
  } catch (e) {
    // Keep original date string if parsing fails
    console.error("Date parsing error:", e)
  }

  for (let i = 0; i < 5; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const flightNumber = `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`

    const departureHour = Math.floor(Math.random() * 20) + 4
    const departureMinute = Math.floor(Math.random() * 60)
    const duration = Math.floor(Math.random() * 180) + 60

    const arrivalTime = new Date(dateObj)
    arrivalTime.setHours(departureHour, departureMinute, 0, 0)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + duration)

    const basePrice = Math.floor(Math.random() * 8000) + 2000
    const originalPrice = Math.random() > 0.5 ? Math.floor(basePrice * 1.2) : null

    flights.push({
      id: `FL${Date.now()}_${i}`,
      airline: airline.name,
      flightNumber,
      departure: {
        airport: fromCity[0],
        city: fromCity[1],
        time: `${departureHour.toString().padStart(2, "0")}:${departureMinute.toString().padStart(2, "0")}`,
        date: displayDate,
        rawDate: dateObj.toISOString().split("T")[0], // Store raw date for booking
      },
      arrival: {
        airport: toCity[0],
        city: toCity[1],
        time: `${arrivalTime.getHours().toString().padStart(2, "0")}:${arrivalTime.getMinutes().toString().padStart(2, "0")}`,
        date: displayDate,
      },
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      price: basePrice,
      originalPrice,
      class: "Economy",
      stops: Math.random() > 0.7 ? 1 : 0,
      available: Math.random() > 0.1,
      amenities: ["WiFi", "Meals"].filter(() => Math.random() > 0.5),
      rating: (Math.random() * 2 + 3).toFixed(1),
    })
  }

  return flights.sort((a, b) => a.price - b.price)
}

function isFlightSearchQuery(message: string): boolean {
  const searchKeywords = [
    "flight",
    "fly",
    "travel",
    "book",
    "ticket",
    "from",
    "to",
    "trip",
    "journey",
    "plane",
    "air",
    "aviation",
    "departure",
    "arrival",
    "cheap",
    "best",
    "options",
    "show",
    "find",
    "search",
  ]
  return searchKeywords.some((keyword) => message.toLowerCase().includes(keyword))
}

function isFlightStatusQuery(message: string): boolean {
  const statusKeywords = ["status", "check", "track", "flight number", "delayed", "on time"]
  const flightNumberPattern = /\b([A-Z0-9]{2})\s*(\d{3,4})\b/i

  return statusKeywords.some((keyword) => message.toLowerCase().includes(keyword)) || flightNumberPattern.test(message)
}

function isGreeting(message: string): boolean {
  const greetings = [
    "hi",
    "hello",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "howdy",
    "namaste",
    "hola",
    "bonjour",
    "ciao",
    "konnichiwa",
    "salaam",
    "ni hao",
  ]
  return greetings.some(
    (greeting) => message.toLowerCase().trim() === greeting || message.toLowerCase().startsWith(`${greeting} `),
  )
}

function generateSuggestions(context: string, language = "en"): string[] {
  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      flight_results: [
        "Show me business class options",
        "Find flights for tomorrow",
        "I need the cheapest option",
        "Show me return flights",
      ],
      booking_confirmation: ["Check flight status", "Modify booking", "Book another flight", "Get boarding pass"],
      flight_status: ["Book another flight", "Modify booking", "Contact airline", "Check baggage allowance"],
      greeting: [
        "I want to fly from Delhi to Mumbai",
        "Show me flights to Bangalore",
        "Find cheap flights to Goa",
        "Check flight status",
      ],
      default: [
        "I want to fly from Delhi to Mumbai tomorrow",
        "Show flights from Bangalore to Chennai",
        "Find cheap flights to Goa",
        "Book a business class ticket",
      ],
    },
    hi: {
      flight_results: [
        "मुझे बिजनेस क्लास के विकल्प दिखाएं",
        "कल के लिए उड़ानें खोजें",
        "मुझे सबसे सस्ता विकल्प चाहिए",
        "मुझे वापसी की उड़ानें दिखाएं",
      ],
      greeting: [
        "मैं दिल्ली से मुंबई जाना चाहता हूं",
        "मुझे बैंगलोर के लिए उड़ानें दिखाएं",
        "गोवा के लिए सस्ती उड़ानें खोजें",
        "उड़ान की स्थिति जांचें",
      ],
      default: [
        "मैं कल दिल्ली से मुंबई जाना चाहता हूं",
        "बैंगलोर से चेन्नई की उड़ानें दिखाएं",
        "गोवा के लिए सस्ती उड़ानें खोजें",
        "एक बिजनेस क्लास टिकट बुक करें",
      ],
    },
    es: {
      flight_results: [
        "Muéstrame opciones de clase ejecutiva",
        "Buscar vuelos para mañana",
        "Necesito la opción más barata",
        "Muéstrame vuelos de regreso",
      ],
      greeting: [
        "Quiero volar de Delhi a Mumbai",
        "Muéstrame vuelos a Bangalore",
        "Encuentra vuelos baratos a Goa",
        "Verificar el estado del vuelo",
      ],
      default: [
        "Quiero volar de Delhi a Mumbai mañana",
        "Mostrar vuelos de Bangalore a Chennai",
        "Encontrar vuelos baratos a Goa",
        "Reservar un billete de clase ejecutiva",
      ],
    },
    fr: {
      flight_results: [
        "Montrez-moi les options de classe affaires",
        "Trouver des vols pour demain",
        "J'ai besoin de l'option la moins chère",
        "Montrez-moi les vols de retour",
      ],
      greeting: [
        "Je veux voler de Delhi à Mumbai",
        "Montrez-moi les vols pour Bangalore",
        "Trouvez des vols pas chers pour Goa",
        "Vérifier l'état du vol",
      ],
      default: [
        "Je veux voler de Delhi à Mumbai demain",
        "Afficher les vols de Bangalore à Chennai",
        "Trouver des vols pas chers pour Goa",
        "Réserver un billet en classe affaires",
      ],
    },
    de: {
      flight_results: [
        "Zeigen Sie mir Business-Class-Optionen",
        "Flüge für morgen finden",
        "Ich brauche die günstigste Option",
        "Zeigen Sie mir Rückflüge",
      ],
      greeting: [
        "Ich möchte von Delhi nach Mumbai fliegen",
        "Zeigen Sie mir Flüge nach Bangalore",
        "Finden Sie günstige Flüge nach Goa",
        "Flugstatus überprüfen",
      ],
      default: [
        "Ich möchte morgen von Delhi nach Mumbai fliegen",
        "Flüge von Bangalore nach Chennai anzeigen",
        "Günstige Flüge nach Goa finden",
        "Ein Business-Class-Ticket buchen",
      ],
    },
  }

  const langSuggestions = suggestions[language] || suggestions.en
  return langSuggestions[context as keyof typeof langSuggestions] || langSuggestions.default
}

function translateResponse(text: string, language: string): string {
  if (language === "en") return text

  const translations: Record<string, Record<string, string>> = {
    hi: {
      "Great! I found": "बढ़िया! मैंने पाया",
      "flights from": "उड़ानें से",
      to: "के लिए",
      "Here are the best options sorted by price": "यहां कीमत के अनुसार सर्वोत्तम विकल्प हैं",
      "I'd be happy to help you find flights": "मैं आपको उड़ानें खोजने में मदद करने के लिए खुश हूं",
      "I need your": "मुझे आपका चाहिए",
      "departure city": "प्रस्थान शहर",
      destination: "गंतव्य",
      "to search for the best options": "सर्वोत्तम विकल्पों की खोज के लिए",
      "Try saying something like": "कुछ ऐसा कहने का प्रयास करें",
      "I want to fly from Delhi to Mumbai tomorrow": "मैं कल दिल्ली से मुंबई जाना चाहता हूं",
      "Hello! How can I help you today?": "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूं?",
    },
    es: {
      "Great! I found": "¡Genial! Encontré",
      "flights from": "vuelos desde",
      to: "a",
      "Here are the best options sorted by price": "Aquí están las mejores opciones ordenadas por precio",
      "I'd be happy to help you find flights": "Estaré encantado de ayudarte a encontrar vuelos",
      "I need your": "Necesito tu",
      "departure city": "ciudad de salida",
      destination: "destino",
      "to search for the best options": "para buscar las mejores opciones",
      "Try saying something like": "Intenta decir algo como",
      "I want to fly from Delhi to Mumbai tomorrow": "Quiero volar de Delhi a Mumbai mañana",
      "Hello! How can I help you today?": "¡Hola! ¿Cómo puedo ayudarte hoy?",
    },
    fr: {
      "Great! I found": "Génial ! J'ai trouvé",
      "flights from": "vols de",
      to: "à",
      "Here are the best options sorted by price": "Voici les meilleures options triées par prix",
      "I'd be happy to help you find flights": "Je serais ravi de vous aider à trouver des vols",
      "I need your": "J'ai besoin de votre",
      "departure city": "ville de départ",
      destination: "destination",
      "to search for the best options": "pour rechercher les meilleures options",
      "Try saying something like": "Essayez de dire quelque chose comme",
      "I want to fly from Delhi to Mumbai tomorrow": "Je veux voler de Delhi à Mumbai demain",
      "Hello! How can I help you today?": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    },
    de: {
      "Great! I found": "Großartig! Ich habe gefunden",
      "flights from": "Flüge von",
      to: "nach",
      "Here are the best options sorted by price": "Hier sind die besten Optionen nach Preis sortiert",
      "I'd be happy to help you find flights": "Ich helfe Ihnen gerne bei der Suche nach Flügen",
      "I need your": "Ich brauche Ihre",
      "departure city": "Abflugstadt",
      destination: "Ziel",
      "to search for the best options": "um die besten Optionen zu suchen",
      "Try saying something like": "Versuchen Sie etwas zu sagen wie",
      "I want to fly from Delhi to Mumbai tomorrow": "Ich möchte morgen von Delhi nach Mumbai fliegen",
      "Hello! How can I help you today?": "Hallo! Wie kann ich Ihnen heute helfen?",
    },
  }

  const langTranslations = translations[language]
  if (!langTranslations) return text

  let translatedText = text
  for (const [eng, trans] of Object.entries(langTranslations)) {
    translatedText = translatedText.replace(new RegExp(eng, "gi"), trans)
  }

  return translatedText
}

function generateResponse(message: string, searchParams: FlightSearchParams, language = "en") {
  if (isGreeting(message)) {
    return {
      text: translateResponse("Hello! How can I help you today?", language),
      suggestions: generateSuggestions("greeting", language),
    }
  }

  if (isFlightStatusQuery(message)) {
    const flightNumberMatch = message.match(/\b([A-Z0-9]{2})\s*(\d{3,4})\b/i)
    const flightNumber = flightNumberMatch ? `${flightNumberMatch[1].toUpperCase()}${flightNumberMatch[2]}` : "6E2345"

    return {
      text: translateResponse(`I'll check the status of flight ${flightNumber} for you.`, language),
      flightStatus: {
        flightNumber,
        status: Math.random() > 0.3 ? "On Time" : "Delayed",
        delay: Math.random() > 0.3 ? null : `${Math.floor(Math.random() * 60) + 15} minutes`,
        gate: `A${Math.floor(Math.random() * 30) + 1}`,
        terminal: Math.floor(Math.random() * 3) + 1,
        scheduledDeparture: "10:30 AM",
        actualDeparture: Math.random() > 0.3 ? "10:30 AM" : "11:15 AM",
        lastUpdated: new Date().toISOString(),
      },
      suggestions: generateSuggestions("flight_status", language),
    }
  }

  if (isFlightSearchQuery(message)) {
    if (searchParams.from && searchParams.to) {
      const flights = generateFlights(searchParams.from, searchParams.to, searchParams.date || "")

      if (flights.length > 0) {
        const fromCity = indianCities[searchParams.from as keyof typeof indianCities]?.[1] || searchParams.from
        const toCity = indianCities[searchParams.to as keyof typeof indianCities]?.[1] || searchParams.to
        const dateText = searchParams.date ? ` on ${searchParams.date}` : ""

        return {
          text: translateResponse(
            `Great! I found ${flights.length} flights from ${fromCity} to ${toCity}${dateText}. Here are the best options sorted by price:`,
            language,
          ),
          flightResults: flights,
          suggestions: generateSuggestions("flight_results", language),
        }
      } else {
        return {
          text: translateResponse(
            `Sorry, I couldn't find any flights for that route. Please check the city names and try again.`,
            language,
          ),
          suggestions: [
            "Try Delhi to Mumbai",
            "Search Bangalore to Chennai",
            "Find flights to Goa",
            "Show popular routes",
          ],
        }
      }
    } else {
      const missingInfo = []
      if (!searchParams.from) missingInfo.push("departure city")
      if (!searchParams.to) missingInfo.push("destination")

      return {
        text: translateResponse(
          `I'd be happy to help you find flights! I need your ${missingInfo.join(" and ")} to search for the best options. Try saying something like "I want to fly from Delhi to Mumbai tomorrow"`,
          language,
        ),
        suggestions: generateSuggestions("default", language),
      }
    }
  }

  if (message.toLowerCase().includes("help") || message.toLowerCase().includes("what can you do")) {
    return {
      text: translateResponse(
        "I can help you with:\n• Search flights between Indian cities\n• Compare prices across airlines\n• Book tickets instantly\n• Check flight status\n• Find the best deals\n• Manage your bookings\n\nJust tell me where you want to go!",
        language,
      ),
      suggestions: generateSuggestions("default", language),
    }
  }

  if (
    message.toLowerCase().includes("price") ||
    message.toLowerCase().includes("cost") ||
    message.toLowerCase().includes("cheap")
  ) {
    return {
      text: translateResponse(
        "I can help you find the best flight prices! Flight costs vary based on destination, dates, and availability. Tell me your travel details and I'll show you the cheapest options first.",
        language,
      ),
      suggestions: [
        "Find cheapest flights to Mumbai",
        "Show budget options to Bangalore",
        "Compare prices to Chennai",
        "Find deals for next week",
      ],
    }
  }

  if (message.toLowerCase().includes("status") || message.toLowerCase().includes("check")) {
    return {
      text: translateResponse(
        "I can check flight status for you! Please provide the flight number (like AI 101 or 6E 2345) and I'll get you the latest information.",
        language,
      ),
      suggestions: ["Check AI 101 status", "Flight 6E 2345 status", "Is my flight on time?", "Show departure delays"],
    }
  }

  if (message.toLowerCase().includes("book") || message.toLowerCase().includes("reserve")) {
    return {
      text: translateResponse(
        "I can help you book flights! First, let me search for available options. Where would you like to travel?",
        language,
      ),
      suggestions: [
        "Delhi to Mumbai flights",
        "Bangalore to Chennai options",
        "Show flights to Goa",
        "Find business class tickets",
      ],
    }
  }

  if (message.toLowerCase().includes("options") || message.toLowerCase().includes("give options")) {
    return {
      text: translateResponse(
        "I'd be happy to show you flight options! Please tell me your departure city, destination, and travel date so I can find the best flights for you.",
        language,
      ),
      suggestions: [
        "I want to fly from Delhi to Mumbai tomorrow",
        "Show flights from Jaipur to Delhi on July 25th",
        "Find flights from Bangalore to Chennai next week",
        "Book a flight to Goa",
      ],
    }
  }

  return {
    text: translateResponse(
      "I understand you're looking for flight information. I can help you search flights, compare prices, and book tickets for destinations across India. Where would you like to travel?",
      language,
    ),
    suggestions: generateSuggestions("default", language),
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, language = "en" } = await request.json()

    const searchParams = extractFlightInfo(message)
    const response = generateResponse(message, searchParams, language)

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        text: "Sorry, I encountered an error processing your request. Please try again.",
        suggestions: ["Try searching again", "Find flights to Mumbai", "Show me help options", "Contact support"],
      },
      { status: 500 },
    )
  }
}
