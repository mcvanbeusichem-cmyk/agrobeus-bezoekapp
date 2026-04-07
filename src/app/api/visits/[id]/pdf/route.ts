import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const visit = await prisma.visit.findUnique({
    where: { id: params.id },
    include: { customer: true },
  })

  if (!visit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const baseUrl = request.nextUrl.origin
  const printUrl = `${baseUrl}/visits/${params.id}/print`

  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-')

  const filename = `Bezoekverslag_${visit.customer.companyName.replace(/\s+/g, '_')}_${visitDateFormatted}.pdf`

  let chromium: typeof import('@sparticuz/chromium').default
  let puppeteer: typeof import('puppeteer-core').default

  try {
    chromium = (await import('@sparticuz/chromium')).default
    puppeteer = (await import('puppeteer-core')).default
  } catch {
    return NextResponse.json({ error: 'PDF generation not available' }, { status: 500 })
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
    })

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } finally {
    await browser.close()
  }
}
