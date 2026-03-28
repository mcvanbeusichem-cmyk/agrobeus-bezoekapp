import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { VisitForm } from '@/components/visits/VisitForm'

export default async function EditVisitPage({ params }: { params: { id: string } }) {
  const visit = await prisma.visit.findUnique({
    where: { id: params.id },
    include: { customer: true },
  })

  if (!visit) notFound()

  return (
    <div className="pb-24">
      <PageHeader
        title="Bezoek bewerken"
        backHref={`/visits/${visit.id}`}
        backLabel="Bezoek"
      />
      <VisitForm
        initialData={{
          ...visit,
          emailedAt: visit.emailedAt?.toISOString() ?? null,
          createdAt: visit.createdAt.toISOString(),
          updatedAt: visit.updatedAt.toISOString(),
        }}
        visitId={visit.id}
        preselectedCustomerId={visit.customerId}
      />
    </div>
  )
}
