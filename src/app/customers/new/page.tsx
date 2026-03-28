import { PageHeader } from '@/components/layout/PageHeader'
import { CustomerForm } from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="Nieuwe klant"
        backHref="/customers"
        backLabel="Klanten"
      />
      <CustomerForm />
    </div>
  )
}
