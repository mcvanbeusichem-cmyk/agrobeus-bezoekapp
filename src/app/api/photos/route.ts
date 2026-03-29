import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const visitId = formData.get('visitId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand meegestuurd' }, { status: 400 })
    }

    if (!visitId) {
      return NextResponse.json({ error: 'Bezoek ID ontbreekt' }, { status: 400 })
    }

    // Check visit exists
    const visit = await prisma.visit.findUnique({ where: { id: visitId } })
    if (!visit) {
      return NextResponse.json({ error: 'Bezoek niet gevonden' }, { status: 404 })
    }

    const filename = `visits/${visitId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const blob = await put(filename, file, {
      access: 'public',
    })

    const photo = await prisma.photo.create({
      data: {
        visitId,
        url: blob.url,
        filename: file.name,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij uploaden foto' }, { status: 500 })
  }
}
