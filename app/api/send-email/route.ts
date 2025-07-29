import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Force dynamic rendering pro API emailů
export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validační schéma pro příchozí data
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Jméno musí mít alespoň 2 znaky." }),
  email: z.string().email({ message: "Zadejte platnou e-mailovou adresu." }),
  subject: z.string().min(5, { message: "Předmět musí mít alespoň 5 znaků." }),
  message: z.string().min(10, { message: "Zpráva musí mít alespoň 10 znaků." }),
})

export async function POST(request: NextRequest) {
  try {
    // Získání dat z requestu
    const body = await request.json()
    
    // Validace dat
    const validatedData = contactFormSchema.parse(body)
    const { name, email, subject, message } = validatedData

    // Kontrola API klíče a konfigurace
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY není nastaven')
      return NextResponse.json(
        { error: 'Služba e-mailu není dostupná. Kontaktujte administrátora.' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const toEmail = process.env.RESEND_TO_EMAIL || 'matejhrabak@gmail.com'

    // Příprava HTML obsahu e-mailu
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nová zpráva z kontaktního formuláře</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1d4ed8; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1d4ed8; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 4px solid #1d4ed8; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nová zpráva z webu Pavel Fišer</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Jméno odesílatele:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">E-mail odesílatele:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Předmět:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Zpráva:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>Tato zpráva byla odeslána z kontaktního formuláře na webu Pavel Fišer.</p>
              <p>Čas odeslání: ${new Date().toLocaleString('cs-CZ')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Příprava textové verze e-mailu
    const textContent = `
Nová zpráva z kontaktního formuláře

Jméno: ${name}
E-mail: ${email}
Předmět: ${subject}

Zpráva:
${message}

---
Čas odeslání: ${new Date().toLocaleString('cs-CZ')}
    `

    // Odeslání e-mailu
    const emailData = await resend.emails.send({
      from: `Kontaktní formulář <${fromEmail}>`,
      to: [toEmail],
      subject: `Kontakt z webu: ${subject}`,
      html: htmlContent,
      text: textContent,
      replyTo: email, // Umožní přímou odpověď na e-mail odesílatele
      headers: {
        'X-Entity-Ref-ID': `contact-form-${Date.now()}`,
      },
    })

    console.log('E-mail úspěšně odeslán:', emailData)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Zpráva byla úspěšně odeslána. Děkuji za kontakt!',
        emailData: emailData 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Chyba při odesílání e-mailu:', error)

    // Rozlišení různých typů chyb
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Neplatná data formuláře', 
          details: (error as any).format() 
        },
        { status: 400 }
      )
    }

    // Resend API chyby
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'Chyba při odesílání e-mailu. Zkuste to prosím později.' },
        { status: 503 }
      )
    }

    // Obecná chyba
    return NextResponse.json(
      { error: 'Došlo k neočekávané chybě. Zkuste to prosím později.' },
      { status: 500 }
    )
  }
}

// Podpora pouze POST metody
export async function GET() {
  return NextResponse.json(
    { error: 'Metoda není podporována' },
    { status: 405 }
  )
}
