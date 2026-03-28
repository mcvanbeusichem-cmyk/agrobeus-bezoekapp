import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, buildVisitEmailHtml } from '@/lib/email'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: params.id },
      include: { customer: true },
    })

    if (!visit) {
      return NextResponse.json({ error: 'Bezoek niet gevonden' }, { status: 404 })
    }

    const { html, text, subject } = buildVisitEmailHtml({
      contactName: visit.customer.contactName,
      companyName: visit.customer.companyName,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime,
      title: visit.title,
      report: visit.report,
      advice: visit.advice,
      actionPoints: visit.actionPoints,
      followUpDate: visit.followUpDate,
      senderName: 'Marco van Beusichem', // Later aanpasbaar via instellingen
    })

    const success = await sendEmail({
      to: visit.customer.email,
      subject,
      html,
      text,
    })

    if (!success) {
      return NextResponse.json({ error: 'E-mail kon niet worden verstuurd' }, { status: 500 })
    }

    // Status bijwerken naar 'verzonden'
    const updatedVisit = await prisma.visit.update({
      where: { id: params.id },
      data: {
        emailedAt: new Date(),
        status: 'verzonden',
      },
    })

    return NextResponse.json({ success: true, emailedAt: updatedVisit.emailedAt })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij versturen e-mail' }, { status: 500 })
  }
}
