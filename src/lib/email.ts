/**
 * E-mail service voor Agrobeus BezoekApp
 *
 * Momenteel een placeholder die de e-mail logt naar de console.
 * Koppel later aan een echte service:
 *   - Resend:     npm install resend
 *   - Nodemailer: npm install nodemailer
 *   - SendGrid:   npm install @sendgrid/mail
 *
 * Vervang de sendEmail functie door de implementatie van jouw keuze.
 */

export interface EmailPayload {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Stuurt een e-mail (placeholder — logt naar console).
 * Retourneert true bij succes, false bij fout.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // ----- PLACEHOLDER: vervang dit door echte mailservice -----
  console.log('\n📧 E-MAIL PLACEHOLDER (nog niet echt verzonden)')
  console.log('Aan:       ', payload.to)
  console.log('Onderwerp: ', payload.subject)
  console.log('Inhoud:\n',   payload.text)
  console.log('---------------------------------------------------\n')

  // Simuleer kort netwerk-delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return true
  // -----------------------------------------------------------

  /* Resend implementatie (uncomment na: npm install resend):
  import { Resend } from 'resend'
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM ?? 'noreply@agrobeusconsulting.nl',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
    return true
  } catch (err) {
    console.error('Mail fout:', err)
    return false
  }
  */
}

/**
 * Genereert een nette HTML e-mail voor een bezoekverslag.
 */
export function buildVisitEmailHtml(params: {
  contactName: string
  companyName: string
  visitDate: string
  visitTime: string
  title: string
  report: string
  advice?: string | null
  actionPoints?: string | null
  followUpDate?: string | null
  senderName: string
}): { html: string; text: string; subject: string } {
  const {
    contactName,
    companyName,
    visitDate,
    visitTime,
    title,
    report,
    advice,
    actionPoints,
    followUpDate,
    senderName,
  } = params

  // Datum netjes opmaken
  const formattedDate = new Date(visitDate).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subject = `Bezoekverslag ${companyName} – ${formattedDate}`

  // Plain text versie
  const textParts: string[] = [
    `Beste ${contactName},`,
    '',
    `Hierbij ontvangt u het verslag van ons bezoek op ${formattedDate} om ${visitTime} uur.`,
    '',
    `ONDERWERP: ${title}`,
    '',
    'VERSLAG',
    report,
  ]

  if (advice) {
    textParts.push('', 'ADVIES', advice)
  }

  if (actionPoints) {
    textParts.push('', 'ACTIEPUNTEN', actionPoints)
  }

  if (followUpDate) {
    const formattedFollowUp = new Date(followUpDate).toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    textParts.push('', `VERVOLGAFSPRAAK: ${formattedFollowUp}`)
  }

  textParts.push(
    '',
    'Met vriendelijke groet,',
    '',
    senderName,
    'Agrobeus Consulting',
    'www.agrobeusconsulting.nl',
  )

  const text = textParts.join('\n')

  // HTML versie
  const sectionStyle = 'margin-bottom: 24px;'
  const labelStyle = 'font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px;'
  const contentStyle = 'font-size: 15px; color: #374151; white-space: pre-wrap; line-height: 1.6;'

  const optionalSections = [
    advice ? `
      <div style="${sectionStyle}">
        <div style="${labelStyle}">Advies</div>
        <div style="${contentStyle}">${escapeHtml(advice)}</div>
      </div>` : '',
    actionPoints ? `
      <div style="${sectionStyle}">
        <div style="${labelStyle}">Actiepunten</div>
        <div style="${contentStyle}">${escapeHtml(actionPoints)}</div>
      </div>` : '',
    followUpDate ? `
      <div style="background: #f0f7ee; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="${labelStyle}">Vervolgafspraak</div>
        <div style="font-size: 15px; color: #2d5422; font-weight: 600;">${new Date(followUpDate).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>` : '',
  ].join('')

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: system-ui, -apple-system, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: #4a8a3a; border-radius: 12px 12px 0 0; padding: 28px 32px;">
      <div style="font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.02em;">
        Agrobeus Consulting
      </div>
      <div style="font-size: 13px; color: #b5d9a8; margin-top: 4px;">Bezoekverslag</div>
    </div>

    <!-- Content -->
    <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">

      <p style="font-size: 15px; color: #374151; margin: 0 0 24px 0;">
        Beste ${escapeHtml(contactName)},
      </p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 28px 0;">
        Hierbij ontvangt u het verslag van ons bezoek op <strong>${formattedDate}</strong> om <strong>${visitTime} uur</strong>.
      </p>

      <!-- Bezoek titel -->
      <div style="background: #f0f7ee; border-left: 4px solid #4a8a3a; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 28px;">
        <div style="${labelStyle}">Onderwerp</div>
        <div style="font-size: 16px; font-weight: 600; color: #2d5422;">${escapeHtml(title)}</div>
      </div>

      <!-- Verslag -->
      <div style="${sectionStyle}">
        <div style="${labelStyle}">Verslag</div>
        <div style="${contentStyle}">${escapeHtml(report)}</div>
      </div>

      ${optionalSections}

      <!-- Afsluiting -->
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Met vriendelijke groet,</p>
      <p style="font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px 0;">${escapeHtml(senderName)}</p>
      <p style="font-size: 14px; color: #4a8a3a; margin: 0;">Agrobeus Consulting</p>
    </div>

    <!-- Footer -->
    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">
      Dit bezoekverslag is gegenereerd via Agrobeus BezoekApp
    </p>
  </div>
</body>
</html>`

  return { html, text, subject }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}
