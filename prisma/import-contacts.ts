import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.env.HOME || '', 'Downloads', 'agrovitae_contacts (1).xlsx')
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  console.log(`${rows.length} rijen gevonden in het bestand...`)

  let created = 0
  let skipped = 0

  for (const row of rows) {
    const companyName = String(row['company_name'] ?? '').trim()
    if (!companyName || companyName === 'Agrobeus Consulting') {
      skipped++
      continue
    }

    const firstName = String(row['firstname'] ?? '').trim()
    const lastName = String(row['lastname'] ?? '').trim()
    const contactPerson = String(row['contact_person_1_name'] ?? '').trim()
    const contactName = contactPerson || [firstName, lastName].filter(Boolean).join(' ') || companyName

    const email = String(row['contact_person_1_email'] ?? row['email'] ?? '').trim()
    const phone = String(row['contact_person_1_phone'] ?? row['phone'] ?? '').trim()

    const address1 = String(row['address1'] ?? '').trim()
    const zipcode = String(row['zipcode'] ?? '').trim()
    const city = String(row['city'] ?? '').trim()
    const addressParts = [address1, [zipcode, city].filter(Boolean).join(' ')].filter(Boolean)
    const address = addressParts.join(', ') || '-'

    if (!email) {
      console.log(`  Overgeslagen (geen e-mail): ${companyName}`)
      skipped++
      continue
    }

    await prisma.customer.create({
      data: {
        companyName,
        contactName,
        email,
        phone: phone || '-',
        address,
        cropType: '-',
        hectares: null,
        notes: null,
      },
    })

    created++
    console.log(`  ✓ ${companyName}`)
  }

  console.log(`\nKlaar! ${created} klanten geïmporteerd, ${skipped} overgeslagen.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
