import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photo = await prisma.photo.findUnique({ where: { id: params.id } })

    if (!photo) {
      return NextResponse.json({ error: 'Foto niet gevonden' }, { status: 404 })
    }

    // Delete from Vercel Blob
    await del(photo.url)

    // Delete from database
    await prisma.photo.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij verwijderen foto' }, { status: 500 })
  }
}
