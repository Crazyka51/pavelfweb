import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || "delivered@resend.dev"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: RESEND_TO_EMAIL, // Send to a predefined admin email
      reply_to: email, // Set the user's email as reply-to
      subject: `Zpráva z webu: ${subject}`,
      html: `
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Předmět:</strong> ${subject}</p>
        <p><strong>Zpráva:</strong></p>
        <p>${message}</p>
      `,
    })

    if (error) {
      console.error("Resend email error:", error)
      return NextResponse.json({ message: "Failed to send email", error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Email sent successfully", data }, { status: 200 })
  } catch (error) {
    console.error("Error in send-email API:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
