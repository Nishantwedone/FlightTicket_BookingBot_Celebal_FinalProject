import { type NextRequest, NextResponse } from "next/server"

interface PaymentRequest {
  bookingId: string
  amount: number
  currency: string
  paymentMethod: string
  cardDetails?: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    holderName: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentData: PaymentRequest = await request.json()

    if (!paymentData.bookingId || !paymentData.amount || !paymentData.paymentMethod) {
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 })
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const isPaymentSuccessful = Math.random() > 0.1

    if (isPaymentSuccessful) {
      const transactionId = `TXN${Date.now().toString().slice(-10)}`

      return NextResponse.json({
        success: true,
        transactionId,
        status: "completed",
        amount: paymentData.amount,
        currency: paymentData.currency,
        bookingId: paymentData.bookingId,
        processedAt: new Date().toISOString(),
        message: "Payment processed successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: "Payment declined by bank",
          bookingId: paymentData.bookingId,
          message: "Please check your payment details and try again",
        },
        { status: 402 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
