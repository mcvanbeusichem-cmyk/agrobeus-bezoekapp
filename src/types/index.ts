export type VisitStatus = 'concept' | 'verzonden' | 'afgerond'

export interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  cropType: string
  hectares: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  visits?: Visit[]
  _count?: { visits: number }
}

export interface Photo {
  id: string
  visitId: string
  url: string
  filename: string
  createdAt: string
}

export interface Visit {
  id: string
  customerId: string
  visitDate: string
  visitTime: string
  title: string
  report: string
  advice: string | null
  actionPoints: string | null
  followUpDate: string | null
  status: VisitStatus
  emailedAt: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
  customer?: Customer
  photos?: Photo[]
}

export interface DashboardData {
  totalCustomers: number
  visitsThisMonth: number
  recentVisits: (Visit & { customer: Customer })[]
  customersNotVisited: Customer[]
  openActionPoints: (Visit & { customer: Customer })[]
}
