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
  const printUrl = `${baseUrl}/visits/${params.id}/print?pdf=1`

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

    // Compress photos to reduce PDF file size
    await page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>('.photo-item img')
      imgs.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) return
        const canvas = document.createElement('canvas')
        const MAX = 600
        const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1)
        canvas.width = Math.round(img.naturalWidth * scale)
        canvas.height = Math.round(img.naturalHeight * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        img.src = canvas.toDataURL('image/jpeg', 0.75)
      })
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
    })

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } finally {
    await browser.close()
  }
}
