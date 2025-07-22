# Flight Booking Bot

A complete flight booking chatbot built with Next.js, React, and TypeScript. This intelligent bot helps users search for flights, compare prices, and book tickets through a conversational interface.

## Features

- **Conversational Interface**: Natural language processing for flight searches
- **Real-time Flight Search**: Dynamic flight results with pricing and availability
- **Smart City Recognition**: Recognizes Indian cities and airports
- **Interactive Booking**: One-click flight booking with confirmations
- **Suggestion System**: Context-aware suggestions for better user experience
- **Responsive Design**: Works perfectly on all devices
- **Professional UI**: Clean, modern interface using shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation Steps

1. **Download and Extract**
   - Download the project files
   - Extract to your desired directory
   - Open terminal/command prompt in the project directory

2. **Install Dependencies**

   npm install


3. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - The flight booking bot should be running!

### Production Build

To create a production build:

\`\`\`bash
npm run build
npm start
\`\`\`

## Usage

### Example Queries

Try these sample queries with the bot:

- "I want to fly from Delhi to Mumbai tomorrow"
- "Show me flights from Jaipur to Delhi on July 25th"
- "Find cheap flights from Bangalore to Chennai"
- "Book a business class ticket to Goa"
- "What flights are available from Pune to Hyderabad?"

### Supported Cities

The bot recognizes major Indian cities including:
- Delhi, Mumbai, Bangalore, Chennai, Kolkata
- Hyderabad, Pune, Ahmedabad, Jaipur, Goa
- Kochi, Lucknow, Chandigarh, and many more

## Project Structure

\`\`\`
flight-booking-bot/
├── app/
│   ├── api/
│   │   ├── bot/message/route.ts    # Bot message processing
│   │   ├── flights/book/route.ts   # Flight booking API
│   │   └── flights/status/route.ts # Flight status API
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main chat interface
├── components/ui/                  # UI components
├── lib/                           # Utility functions
├── package.json                   # Dependencies
├── tailwind.config.js            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
\`\`\`

## Customization

### Adding New Cities

Edit the `indianCities` object in `app/api/bot/message/route.ts`:

\`\`\`typescript
const indianCities = {
  yourcity: ["CODE", "City Name", "Alternative Name"],
  // ... existing cities
}
\`\`\`

### Adding New Airlines

Modify the `airlines` array in the same file:

\`\`\`typescript
const airlines = [
  { name: "Your Airline", code: "YA" },
  // ... existing airlines
]
\`\`\`

### Customizing Responses

Update the `generateResponse` function to modify bot responses and add new conversation flows.

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   \`\`\`bash
   npm run dev -- -p 3001
   \`\`\`

2. **Dependencies not installing**
   \`\`\`bash
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

3. **Build errors**
   \`\`\`bash
   npm run lint
   npm run build
   \`\`\`

## Support

If you encounter any issues:

1. Check that all dependencies are installed correctly
2. Ensure Node.js version is 18 or higher
3. Try clearing cache: `npm cache clean --force`
4. Restart the development server

## License

This project is for educational and demonstration purposes.
# FlightTicket_BookingBot_Celebal_FinalProject
