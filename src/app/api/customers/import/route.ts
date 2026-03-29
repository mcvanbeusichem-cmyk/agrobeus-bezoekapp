import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand meegestuurd' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Geen rijen gevonden in het bestand' }, { status: 400 })
    }

    const created: string[] = []
    const skipped: string[] = []

    for (const row of rows) {
      const companyName = String(row['Bedrijfsnaam'] ?? row['companyName'] ?? '').trim()
      const contactName = String(row['Contactpersoon'] ?? row['contactName'] ?? '').trim()
      const email = String(row['Email'] ?? row['E-mail'] ?? row['email'] ?? '').trim()
      const phone = String(row['Telefoon'] ?? row['phone'] ?? '').trim()
      const address = String(row['Adres'] ?? row['address'] ?? '').trim()
      const cropType = String(row['Teelt'] ?? row['Gewas'] ?? row['cropType'] ?? '').trim()
      const hectaresRaw = row['Hectares'] ?? row['hectares']
      const hectares = hectaresRaw !== undefined && hectaresRaw !== '' ? parseFloat(String(hectaresRaw)) : null
      const notes = String(row['Notities'] ?? row['notes'] ?? '').trim()

      if (!companyName || !contactName || !email) {
        skipped.push(companyName || '(onbekend)')
        continue
      }

      await prisma.customer.create({
        data: {
          companyName,
          contactName,
          email,
          phone: phone || '-',
          address: address || '-',
          cropType: cropType || '-',
          hectares: isNaN(hectares!) ? null : hectares,
          notes: notes || null,
        },
      })

      created.push(companyName)
    }

    return NextResponse.json({
      message: `${created.length} klant(en) geïmporteerd`,
      created,
      skipped,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij verwerken van bestand' }, { status: 500 })
  }
}
