import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { CustomerForm } from '@/components/customers/CustomerForm'

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  })

  if (!customer) notFound()

  return (
    <div className="pb-24">
      <PageHeader
        title="Klant bewerken"
        backHref={`/customers/${customer.id}`}
        backLabel={customer.companyName}
      />
      <CustomerForm
        initialData={{
          ...customer,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
        }}
        customerId={customer.id}
      />
    </div>
  )
}
