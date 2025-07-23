"use client"

// import Link from "next/link"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Bot,
  User,
  Plane,
  Clock,
  Calendar,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Filter,
  CreditCard,
  CheckCircle,
  UserCircle,
  Ticket,
  Menu,
  Mail,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  flightResults?: FlightResult[]
  bookingConfirmation?: BookingConfirmation
  suggestions?: string[]
  flightStatus?: FlightStatus
}

interface FlightResult {
  id: string
  airline: string
  flightNumber: string
  departure: {
    airport: string
    city: string
    time: string
    date: string
    rawDate?: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  duration: string
  price: number
  originalPrice?: number
  class: string
  stops: number
  available: boolean
  amenities: string[]
  rating: number
}

interface BookingConfirmation {
  bookingId: string
  flightNumber: string
  passenger: string
  departure: string
  arrival: string
  date: string
  price: number
  status: string
}

interface FlightStatus {
  flightNumber: string
  status: string
  delay: string | null
  gate: string
  terminal: number
  scheduledDeparture: string
  actualDeparture: string
  lastUpdated: string
}

interface FilterOptions {
  priceRange: [number, number]
  airlines: string[]
  stops: number[]
  departureTime: string[]
  arrivalTime: string[]
  duration: number | null
}

interface UserProfile {
  name: string
  email: string
  phone: string
  bookings: BookingConfirmation[]
}

interface RobotState {
  mood: "happy" | "thinking" | "excited" | "confused"
  message: string
  visible: boolean
}

export default function FlightBookingBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("en")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [currentFlight, setCurrentFlight] = useState<FlightResult | null>(null)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    priceRange: [0, 20000],
    airlines: [],
    stops: [],
    departureTime: [],
    arrivalTime: [],
    duration: null,
  })
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [passengerName, setPassengerName] = useState("John Doe")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    bookings: [],
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [robotState, setRobotState] = useState<RobotState>({
    mood: "happy",
    message: "Hi there! I'm Flighty, your AI travel assistant!",
    visible: true,
  })
  const [emailNotifications, setEmailNotifications] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fix hydration error by initializing messages after component mount
  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: getWelcomeMessage(language),
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "I want to fly from Delhi to Mumbai tomorrow",
          "Show me flights from Jaipur to Delhi on July 25th",
          "Find cheap flights from Bangalore to Chennai",
          "Book a business class ticket to Goa",
        ],
      },
    ])
  }, [])

  const getWelcomeMessage = (lang: string) => {
    const messages: Record<string, string> = {
      en: "Hello! I'm your flight booking assistant. I can help you search for flights, compare prices, and book tickets. Try asking me something like 'I want to fly from Delhi to Mumbai tomorrow' or 'Show me flights from Jaipur to Delhi on July 25th'",
      hi: "नमस्ते! मैं आपका फ्लाइट बुकिंग सहायक हूं। मैं उड़ानों की खोज करने, कीमतों की तुलना करने और टिकट बुक करने में आपकी मदद कर सकता हूं। मुझसे कुछ ऐसा पूछने का प्रयास करें जैसे 'मैं कल दिल्ली से मुंबई जाना चाहता हूं' या 'मुझे 25 जुलाई को जयपुर से दिल्ली की उड़ानें दिखाएं'",
      es: "¡Hola! Soy tu asistente de reserva de vuelos. Puedo ayudarte a buscar vuelos, comparar precios y reservar billetes. Intenta preguntarme algo como 'Quiero volar de Delhi a Mumbai mañana' o 'Muéstrame vuelos de Jaipur a Delhi el 25 de julio'",
      fr: "Bonjour ! Je suis votre assistant de réservation de vols. Je peux vous aider à rechercher des vols, comparer les prix et réserver des billets. Essayez de me demander quelque chose comme 'Je veux voler de Delhi à Mumbai demain' ou 'Montrez-moi les vols de Jaipur à Delhi le 25 juillet'",
      de: "Hallo! Ich bin Ihr Flugbuchungsassistent. Ich kann Ihnen helfen, Flüge zu suchen, Preise zu vergleichen und Tickets zu buchen. Versuchen Sie, mich etwas zu fragen wie 'Ich möchte morgen von Delhi nach Mumbai fliegen' oder 'Zeigen Sie mir Flüge von Jaipur nach Delhi am 25. Juli'",
    }
    return messages[lang] || messages.en
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const updateRobotState = (mood: RobotState["mood"], message: string) => {
    setRobotState({
      mood,
      message,
      visible: true,
    })

    // Hide robot message after 5 seconds
    setTimeout(() => {
      setRobotState((prev) => ({ ...prev, visible: false }))
    }, 5000)
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Update robot state
    updateRobotState("thinking", "Let me search for that information...")

    try {
      const response = await fetch("/api/bot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend, language }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: "bot",
        timestamp: new Date(),
        flightResults: data.flightResults,
        bookingConfirmation: data.bookingConfirmation,
        suggestions: data.suggestions,
        flightStatus: data.flightStatus,
      }

      setMessages((prev) => [...prev, botMessage])

      // Update robot state based on results
      if (data.flightResults && data.flightResults.length > 0) {
        updateRobotState("excited", "I found some great flights for you!")
      } else if (data.flightStatus) {
        updateRobotState("happy", "Here's the flight status you requested!")
      } else {
        updateRobotState("happy", "I hope that helps! Anything else you need?")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      updateRobotState("confused", "Oops! Something went wrong. Can you try again?")
    }

    setIsLoading(false)
  }

  const handleBookFlight = async (flight: FlightResult) => {
    setCurrentFlight(flight)
    setShowPaymentDialog(true)
    updateRobotState("excited", "Great choice! Let's complete your booking.")
  }

  const handlePaymentSubmit = async () => {
    if (!currentFlight) return

    setPaymentStatus("processing")
    updateRobotState("thinking", "Processing your payment...")

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Prepare booking data with correct flight information
      const bookingData = {
        flightId: currentFlight.id,
        passengerName,
        email: userProfile.email,
        phone: userProfile.phone,
        departure: currentFlight.departure.city,
        arrival: currentFlight.arrival.city,
        date: currentFlight.departure.rawDate || currentFlight.departure.date,
        flightNumber: currentFlight.flightNumber,
        price: currentFlight.price,
      }

      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      // Add booking to user profile
      setUserProfile((prev) => ({
        ...prev,
        bookings: [...prev.bookings, data.booking],
      }))

      setPaymentStatus("success")
      updateRobotState("happy", "Booking successful! Your tickets are confirmed.")

      // Close dialog after success animation
      setTimeout(() => {
        setShowPaymentDialog(false)
        setPaymentStatus("idle")

        // Add confirmation message to chat
        const confirmationMessage: Message = {
          id: Date.now().toString(),
          text: "Great! Your flight has been booked successfully. Here are your booking details:",
          sender: "bot",
          timestamp: new Date(),
          bookingConfirmation: data.booking,
          suggestions: ["Check flight status", "Modify booking", "Book another flight", "Get boarding pass"],
        }

        setMessages((prev) => [...prev, confirmationMessage])
      }, 1500)
    } catch (error) {
      setPaymentStatus("error")
      updateRobotState("confused", "Payment failed. Please try again.")

      setTimeout(() => {
        setPaymentStatus("idle")
      }, 1500)

      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, there was an error processing your payment. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    // Handle special suggestion actions
    if (suggestion === "Check flight status") {
      const lastBooking = messages
        .filter((m) => m.bookingConfirmation)
        .map((m) => m.bookingConfirmation)
        .pop()

      if (lastBooking) {
        await handleCheckFlightStatus(lastBooking.flightNumber)
      } else {
        handleSendMessage("Check flight status")
      }
      return
    }

    if (suggestion === "Modify booking") {
      const lastBooking = messages
        .filter((m) => m.bookingConfirmation)
        .map((m) => m.bookingConfirmation)
        .pop()

      if (lastBooking) {
        await handleModifyBooking(lastBooking.bookingId)
      } else {
        handleSendMessage("I want to modify my booking")
      }
      return
    }

    if (suggestion === "Book another flight") {
      handleSendMessage("I want to book another flight")
      return
    }

    if (suggestion === "Get boarding pass") {
      const lastBooking = messages
        .filter((m) => m.bookingConfirmation)
        .map((m) => m.bookingConfirmation)
        .pop()

      if (lastBooking) {
        await handleGetBoardingPass(lastBooking.bookingId)
      } else {
        handleSendMessage("Get my boarding pass")
      }
      return
    }

    // For regular suggestions, just send the message
    handleSendMessage(suggestion)
  }

  const handleCheckFlightStatus = async (flightNumber: string) => {
    setIsLoading(true)
    updateRobotState("thinking", "Checking flight status...")

    try {
      const response = await fetch(`/api/flights/status?flightNumber=${flightNumber}`)
      const data = await response.json()

      const statusMessage: Message = {
        id: Date.now().toString(),
        text: `Here's the current status for flight ${flightNumber}:`,
        sender: "bot",
        timestamp: new Date(),
        flightStatus: data.flightStatus,
        suggestions: ["Book another flight", "Modify booking", "Contact airline"],
      }

      setMessages((prev) => [...prev, statusMessage])
      updateRobotState(
        "happy",
        data.flightStatus.status === "On Time"
          ? "Good news! Your flight is on time."
          : "Your flight is delayed. Please check the details.",
      )
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't retrieve the flight status. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      updateRobotState("confused", "I couldn't get the flight status. Let's try again later.")
    }

    setIsLoading(false)
  }

  const handleModifyBooking = async (bookingId: string) => {
    updateRobotState("thinking", "Let me pull up your booking details...")

    const modificationMessage: Message = {
      id: Date.now().toString(),
      text: `To modify booking ${bookingId}, please contact our customer service at 1-800-123-4567 or reply with what you'd like to change (date, passenger details, seat selection).`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["Change date", "Change passenger name", "Select seats", "Cancel booking"],
    }

    setMessages((prev) => [...prev, modificationMessage])
    updateRobotState("happy", "I can help you modify your booking!")
  }

  const handleGetBoardingPass = async (bookingId: string) => {
    updateRobotState("happy", "Your boarding pass is ready!")

    const boardingPassMessage: Message = {
      id: Date.now().toString(),
      text: `Your boarding pass for booking ${bookingId} has been sent to your email. You can also download it from the airline's website or mobile app using your booking reference.`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["Check flight status", "Book another flight", "Contact airline"],
    }

    setMessages((prev) => [...prev, boardingPassMessage])
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)

    let welcomeMessage = ""
    switch (newLanguage) {
      case "en":
        welcomeMessage = "Language changed to English"
        updateRobotState("happy", "I'll speak English now!")
        break
      case "hi":
        welcomeMessage = "भाषा हिंदी में बदल दी गई है"
        updateRobotState("happy", "अब मैं हिंदी में बात करूंगा!")
        break
      case "es":
        welcomeMessage = "Idioma cambiado a Español"
        updateRobotState("happy", "¡Ahora hablaré en español!")
        break
      case "fr":
        welcomeMessage = "Langue changée en Français"
        updateRobotState("happy", "Je parlerai français maintenant!")
        break
      case "de":
        welcomeMessage = "Sprache auf Deutsch geändert"
        updateRobotState("happy", "Ich werde jetzt Deutsch sprechen!")
        break
      default:
        welcomeMessage = "Language changed to English"
        updateRobotState("happy", "I'll speak English now!")
    }

    const languageChangeMessage: Message = {
      id: Date.now().toString(),
      text: welcomeMessage,
      sender: "bot",
      timestamp: new Date(),
      suggestions: [
        newLanguage === "en"
          ? "I want to book a flight"
          : newLanguage === "hi"
            ? "मैं एक उड़ान बुक करना चाहता हूं"
            : newLanguage === "es"
              ? "Quiero reservar un vuelo"
              : newLanguage === "fr"
                ? "Je veux réserver un vol"
                : "Ich möchte einen Flug buchen",
      ],
    }

    setMessages((prev) => [...prev, languageChangeMessage])
  }

  const handleCancelBooking = (bookingId: string) => {
    // Update user profile to mark booking as cancelled
    setUserProfile((prev) => ({
      ...prev,
      bookings: prev.bookings.map((booking) =>
        booking.bookingId === bookingId ? { ...booking, status: "Cancelled" } : booking,
      ),
    }))

    updateRobotState("thinking", "Processing your cancellation...")

    // Show cancellation message
    const cancellationMessage: Message = {
      id: Date.now().toString(),
      text: `Your booking ${bookingId} has been cancelled. A refund will be processed within 5-7 business days.`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["Book another flight", "Check refund status", "Contact customer service"],
    }

    setMessages((prev) => [...prev, cancellationMessage])
    setShowProfileSheet(false)

    setTimeout(() => {
      updateRobotState("happy", "Your booking has been cancelled and refund initiated!")
    }, 1500)
  }

  const FlightCard = ({ flight }: { flight: FlightResult }) => (
    <Card className="mb-4 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-blue-600 flex items-center space-x-2">
              <span>
                {flight.airline} {flight.flightNumber}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{flight.rating}</span>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">{flight.class}</Badge>
              {flight.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-1">
                  {amenity === "WiFi" && <Wifi className="w-3 h-3 text-blue-500" />}
                  {amenity === "Meals" && <Coffee className="w-3 h-3 text-brown-500" />}
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {flight.originalPrice && (
                <span className="text-sm text-gray-400 line-through">₹{flight.originalPrice}</span>
              )}
              <div className="text-2xl font-bold text-green-600">₹{flight.price}</div>
            </div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <div>
              <div className="font-semibold">{flight.departure.city}</div>
              <div className="text-sm text-gray-500">{flight.departure.airport}</div>
              <div className="text-sm font-medium">{flight.departure.time}</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <Plane className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <div className="text-sm text-gray-500">{flight.duration}</div>
              <div className="text-xs text-gray-400">
                {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <div>
              <div className="font-semibold">{flight.arrival.city}</div>
              <div className="text-sm text-gray-500">{flight.arrival.airport}</div>
              <div className="text-sm font-medium">{flight.arrival.time}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{flight.departure.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{flight.duration}</span>
            </div>
          </div>

          <Button
            onClick={() => handleBookFlight(flight)}
            disabled={!flight.available || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {flight.available ? "Book Now" : "Sold Out"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const BookingConfirmationCard = ({ booking }: { booking: BookingConfirmation }) => (
    <Card className="mb-4 border-l-4 border-l-green-500 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✓</div>
          <span>Booking Confirmed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Booking ID:</span> {booking.bookingId}
          </div>
          <div>
            <span className="font-semibold">Flight:</span> {booking.flightNumber}
          </div>
          <div>
            <span className="font-semibold">Passenger:</span> {booking.passenger}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {booking.date}
          </div>
          <div>
            <span className="font-semibold">Route:</span> {booking.departure} → {booking.arrival}
          </div>
          <div>
            <span className="font-semibold">Total:</span>{" "}
            <span className="text-green-600 font-bold">₹{booking.price}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Your e-ticket has been sent to your email. Please arrive at the airport 2 hours before departure.
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const FlightStatusCard = ({ status }: { status: FlightStatus }) => (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plane className="w-5 h-5" />
          <span>Flight Status: {status.flightNumber}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <Badge
              className={status.status === "On Time" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {status.status}
            </Badge>
          </div>
          {status.delay && (
            <div>
              <span className="font-semibold">Delay:</span> {status.delay}
            </div>
          )}
          <div>
            <span className="font-semibold">Gate:</span> {status.gate}
          </div>
          <div>
            <span className="font-semibold">Terminal:</span> {status.terminal}
          </div>
          <div>
            <span className="font-semibold">Scheduled:</span> {status.scheduledDeparture}
          </div>
          <div>
            <span className="font-semibold">Actual:</span> {status.actualDeparture}
          </div>
          <div className="col-span-2 text-xs text-gray-500">
            Last updated: {new Date(status.lastUpdated).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SuggestionChips = ({ suggestions }: { suggestions: string[] }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleSuggestionClick(suggestion)}
          className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )

  const AIRobot = () => {
    const getFaceExpression = () => {
      switch (robotState.mood) {
        case "happy":
          return "^‿^"
        case "thinking":
          return "•﹏•"
        case "excited":
          return "≧◡≦"
        case "confused":
          return "⊙﹏⊙"
        default:
          return "^‿^"
      }
    }

    return (
      <div
        className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ${robotState.visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex flex-col items-end">
          <div className="bg-white p-3 rounded-lg shadow-lg mb-2 max-w-xs">
            <p className="text-sm">{robotState.message}</p>
          </div>
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl cursor-pointer hover:bg-blue-700 transition-colors">
            {getFaceExpression()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-4 md:px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Flight Booking Bot</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Your intelligent travel assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 bg-transparent"
              onClick={() => setShowFilterDialog(true)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {/* <Link href="/admin" passHref>
      <a className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
        View Admin Dashboard
      </a>
    </Link> */}

            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => handleLanguageChange("en")}
              >
                EN
              </Button>
              <Button
                variant={language === "hi" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => handleLanguageChange("hi")}
              >
                HI
              </Button>
              <Button
                variant={language === "es" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => handleLanguageChange("es")}
              >
                ES
              </Button>
              <Button
                variant={language === "fr" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => handleLanguageChange("fr")}
              >
                FR
              </Button>
              <Button
                variant={language === "de" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => handleLanguageChange("de")}
              >
                DE
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setShowProfileSheet(true)}
            >
              <UserCircle className="w-4 h-4" />
              <span>Profile</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t pt-2">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setShowFilterDialog(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setShowProfileSheet(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Button>

              <div className="flex justify-between items-center px-2 py-1">
                <span className="text-sm text-gray-500">Language:</span>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={language === "en" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 px-2"
                    onClick={() => handleLanguageChange("en")}
                  >
                    EN
                  </Button>
                  <Button
                    variant={language === "hi" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 px-2"
                    onClick={() => handleLanguageChange("hi")}
                  >
                    HI
                  </Button>
                  <Button
                    variant={language === "es" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 px-2"
                    onClick={() => handleLanguageChange("es")}
                  >
                    ES
                  </Button>
                  <Button
                    variant={language === "fr" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 px-2"
                    onClick={() => handleLanguageChange("fr")}
                  >
                    FR
                  </Button>
                  <Button
                    variant={language === "de" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 px-2"
                    onClick={() => handleLanguageChange("de")}
                  >
                    DE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex space-x-3 max-w-full md:max-w-4xl ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={message.sender === "user" ? "bg-blue-100" : "bg-gray-100"}>
                  {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex flex-col space-y-2 ${message.sender === "user" ? "items-end" : "items-start"} max-w-[calc(100%-3rem)]`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                </div>

                {message.suggestions && message.sender === "bot" && (
                  <SuggestionChips suggestions={message.suggestions} />
                )}

                {message.flightResults && message.flightResults.length > 0 && (
                  <div className="w-full">
                    {message.flightResults.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                )}

                {message.bookingConfirmation && (
                  <div className="w-full">
                    <BookingConfirmationCard booking={message.bookingConfirmation} />
                  </div>
                )}

                {message.flightStatus && (
                  <div className="w-full">
                    <FlightStatusCard status={message.flightStatus} />
                  </div>
                )}

                <span className="text-xs text-gray-400">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-100">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border shadow-sm px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex space-x-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message... (e.g., 'I want to fly from Delhi to Mumbai tomorrow')"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Robot Assistant */}
      <AIRobot />

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
          </DialogHeader>

          {paymentStatus === "idle" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="passenger-name">Passenger Name</Label>
                  <Input id="passenger-name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <Label htmlFor="email-notifications" className="text-sm text-gray-600">
                      Send booking confirmation and updates via email
                    </Label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <RadioGroup defaultValue="credit-card" onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="net-banking" id="net-banking" />
                      <Label htmlFor="net-banking">Net Banking</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="110001" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="grid gap-2">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input id="upi-id" placeholder="yourname@upi" />
                  </div>
                )}

                {paymentMethod === "net-banking" && (
                  <div className="grid gap-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <select
                      id="bank"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="special-requests">Special Requests (Optional)</Label>
                  <Textarea id="special-requests" placeholder="Any special requirements or requests..." />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePaymentSubmit}>Pay & Confirm Booking</Button>
              </DialogFooter>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Processing Payment...</p>
              <p className="text-sm text-gray-500">Please do not close this window</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600">Payment Successful!</p>
              <p className="text-sm text-gray-500">Your booking is confirmed</p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-2xl">✕</span>
              </div>
              <p className="text-lg font-medium text-red-600">Payment Failed</p>
              <p className="text-sm text-gray-500">Please try again or use a different payment method</p>

              <Button className="mt-4" onClick={() => setPaymentStatus("idle")}>
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Flight Results</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="price">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="airlines">Airlines</TabsTrigger>
              <TabsTrigger value="stops">Stops</TabsTrigger>
              <TabsTrigger value="times">Times</TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="space-y-4">
              <div>
                <Label>Price Range</Label>
                <div className="flex items-center justify-between mt-2">
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={filterOptions.priceRange[0]}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        priceRange: [Number(e.target.value), prev.priceRange[1]],
                      }))
                    }
                    className="w-full"
                  />
                  <span>₹{filterOptions.priceRange[0]}</span>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={filterOptions.priceRange[1]}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Number(e.target.value)],
                      }))
                    }
                    className="w-full"
                  />
                  <span>₹{filterOptions.priceRange[1]}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="airlines" className="space-y-4">
              <div className="grid gap-2">
                {["IndiGo", "Air India", "SpiceJet", "Vistara", "GoAir"].map((airline) => (
                  <div key={airline} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`airline-${airline}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <Label htmlFor={`airline-${airline}`}>{airline}</Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stops" className="space-y-4">
              <div className="grid gap-2">
                {["Non-stop", "1 Stop", "2+ Stops"].map((stop) => (
                  <div key={stop} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`stop-${stop}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <Label htmlFor={`stop-${stop}`}>{stop}</Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="times" className="space-y-4">
              <div>
                <Label>Departure Time</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`dep-${time}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <Label htmlFor={`dep-${time}`}>{time}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Arrival Time</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`arr-${time}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <Label htmlFor={`arr-${time}`}>{time}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Profile</SheetTitle>
          </SheetHeader>

          <div className="py-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{userProfile.name}</h3>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
                <p className="text-sm text-gray-500">{userProfile.phone}</p>
              </div>
            </div>

            <Tabs defaultValue="bookings">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <h4 className="font-medium">Your Bookings</h4>

                {userProfile.bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No bookings found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 bg-transparent"
                      onClick={() => {
                        setShowProfileSheet(false)
                        handleSendMessage("I want to book a flight")
                      }}
                    >
                      Book a Flight
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProfile.bookings
                      .filter((booking) => booking.status !== "Cancelled")
                      .map((booking) => (
                        <Card key={booking.bookingId} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{booking.flightNumber}</CardTitle>
                              <Badge className="bg-green-100 text-green-800">{booking.status}</Badge>
                            </div>
                            <CardDescription>
                              {booking.departure} → {booking.arrival}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Passenger:</span>
                                <span>{booking.passenger}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Price:</span>
                                <span className="font-medium">₹{booking.price}</span>
                              </div>
                            </div>
                          </CardContent>
                          <div className="px-6 py-2 border-t flex justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowProfileSheet(false)
                                handleCheckFlightStatus(booking.flightNumber)
                              }}
                            >
                              Check Status
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.bookingId)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <h4 className="font-medium">Booking History</h4>

                {userProfile.bookings.filter((booking) => booking.status === "Cancelled").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No booking history found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProfile.bookings
                      .filter((booking) => booking.status === "Cancelled")
                      .map((booking) => (
                        <Card key={booking.bookingId} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{booking.flightNumber}</CardTitle>
                              <Badge className="bg-red-100 text-red-800">{booking.status}</Badge>
                            </div>
                            <CardDescription>
                              {booking.departure} → {booking.arrival}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Passenger:</span>
                                <span>{booking.passenger}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Price:</span>
                                <span className="font-medium">₹{booking.price}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <h4 className="font-medium">Account Settings</h4>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="email-pref"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <Label htmlFor="email-pref" className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>Email Notifications</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Preferred Language</Label>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button
                        variant={language === "en" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1 rounded-none"
                        onClick={() => handleLanguageChange("en")}
                      >
                        English
                      </Button>
                      <Button
                        variant={language === "hi" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1 rounded-none"
                        onClick={() => handleLanguageChange("hi")}
                      >
                        हिंदी
                      </Button>
                      <Button
                        variant={language === "es" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1 rounded-none"
                        onClick={() => handleLanguageChange("es")}
                      >
                        Español
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">Save Changes</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
