import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintActions } from './PrintActions'

interface PrintPageProps {
  params: { id: string }
}

export default async function PrintPage({ params }: PrintPageProps) {
  const visit = await prisma.visit.findUnique({
    where: { id: params.id },
    include: { customer: true, photos: true },
  })

  if (!visit) {
    notFound()
  }

  const formattedDate = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const now = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 48px;
        }
        .header {
          border-bottom: 3px solid #2d6a4f;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .brand {
          font-size: 22px;
          font-weight: 700;
          color: #2d6a4f;
          letter-spacing: -0.3px;
        }
        .brand-sub {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .print-date {
          font-size: 12px;
          color: #6b7280;
          text-align: right;
        }
        .report-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 16px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .meta-item label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        .meta-item p {
          font-size: 14px;
          color: #111827;
          font-weight: 500;
        }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          color: #2d6a4f;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid #d1fae5;
          padding-bottom: 6px;
          margin-bottom: 12px;
        }
        .section-content {
          font-size: 14px;
          color: #374151;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        .action-list {
          list-style: none;
          padding: 0;
        }
        .action-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 14px;
          color: #374151;
        }
        .action-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2d6a4f;
          flex-shrink: 0;
          margin-top: 7px;
        }
        .followup-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 24px;
        }
        .followup-box label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #065f46;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .followup-box p {
          font-size: 15px;
          font-weight: 600;
          color: #064e3b;
        }
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }
        .photo-item img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-brand {
          font-size: 13px;
          font-weight: 600;
          color: #2d6a4f;
        }
        .footer-page {
          font-size: 12px;
          color: #9ca3af;
        }
        .no-print {
          position: fixed;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }
        .btn-close {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .btn-print {
          background: #2d6a4f;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .container {
            padding: 20px 24px;
          }
          .followup-box {
            background: #ecfdf5 !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <PrintActions />

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div>
              <div className="brand">Agrobeus Consulting</div>
              <div className="brand-sub">Bezoekverslag</div>
            </div>
            <div className="print-date">
              Aangemaakt op {now}
            </div>
          </div>
          <div className="report-title">{visit.title}</div>
        </div>

        {/* Klant & datum info */}
        <div className="meta-grid">
          <div className="meta-item">
            <label>Bedrijf</label>
            <p>{visit.customer.companyName}</p>
          </div>
          <div className="meta-item">
            <label>Contactpersoon</label>
            <p>{visit.customer.contactName}</p>
          </div>
          <div className="meta-item">
            <label>Datum</label>
            <p style={{ textTransform: 'capitalize' }}>{formattedDate}</p>
          </div>
          <div className="meta-item">
            <label>Tijd</label>
            <p>{visit.visitTime} uur</p>
          </div>
          {visit.customer.address && (
            <div className="meta-item">
              <label>Adres</label>
              <p>{visit.customer.address}</p>
            </div>
          )}
          {visit.customer.cropType && (
            <div className="meta-item">
              <label>Gewas</label>
              <p>{visit.customer.cropType}</p>
            </div>
          )}
        </div>

        {/* Verslag */}
        <div className="section">
          <div className="section-title">Verslag</div>
          <div className="section-content">{visit.report}</div>
        </div>

        {/* Advies */}
        {visit.advice && (
          <div className="section">
            <div className="section-title">Advies</div>
            <div className="section-content">{visit.advice}</div>
          </div>
        )}

        {/* Actiepunten */}
        {visit.actionPoints && (
          <div className="section">
            <div className="section-title">Actiepunten</div>
            <ul className="action-list">
              {visit.actionPoints.split('\n').filter(Boolean).map((point, i) => (
                <li key={i}>
                  <div className="action-dot" />
                  <span>{point.replace(/^[-•]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vervolgafspraak */}
        {visit.followUpDate && (
          <div className="followup-box">
            <label>Vervolgafspraak</label>
            <p>
              {new Date(visit.followUpDate).toLocaleDateString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Foto's */}
        {visit.photos && visit.photos.length > 0 && (
          <div className="section">
            <div className="section-title">Foto&apos;s</div>
            <div className="photos-grid">
              {visit.photos.map((photo) => (
                <div key={photo.id} className="photo-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.filename} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <div className="footer-brand">Agrobeus Consulting</div>
          <div className="footer-page">
            {visit.customer.companyName} &bull; {visit.visitDate}
          </div>
        </div>
      </div>
    </>
  )
}
