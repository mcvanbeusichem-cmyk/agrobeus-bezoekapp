import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { VisitForm } from '@/components/visits/VisitForm'

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: { customerId?: string }
}) {
  const preselectedCustomerId = searchParams.customerId

  // Laad klantgegevens voor de klant-selector
  const customers = await prisma.customer.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      address: true,
      cropType: true,
      hectares: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  let backHref = '/customers'
  if (preselectedCustomerId) {
    backHref = `/customers/${preselectedCustomerId}`
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Nieuw bezoek"
        backHref={backHref}
        backLabel="Terug"
      />
      <VisitForm
        customers={customers.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
        preselectedCustomerId={preselectedCustomerId}
      />
    </div>
  )
}
