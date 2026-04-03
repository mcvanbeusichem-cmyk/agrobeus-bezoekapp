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
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #1f2937;
          background: #fff;
        }

        /* ── Groene rand rondom de pagina ── */
        .border-top    { position: fixed; top: 0; left: 0; right: 0; height: 12px; background: #4a8a3a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-bottom { position: fixed; bottom: 0; left: 0; right: 0; height: 12px; background: #4a8a3a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-left   { position: fixed; top: 0; left: 0; bottom: 0; width: 12px; background: #4a8a3a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-right  { position: fixed; top: 0; right: 0; bottom: 0; width: 12px; background: #4a8a3a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }

        /* ── Watermark peer (groot, vaag, gecentreerd) ── */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 680px;
          height: 680px;
          background-image: url('/logo.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0.055;
          pointer-events: none;
          z-index: 0;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        /* ── Pagina inhoud ── */
        .page {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          padding: 22px 52px 36px;
        }

        /* ── Header ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 14px;
          border-bottom: 1.5px solid #d1fae5;
          margin-bottom: 16px;
        }
        .header-left .logo {
          height: 80px;
          width: auto;
          display: block;
        }
        .header-left .doc-type {
          margin-top: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #2d6a4f;
        }
        .header-right {
          text-align: right;
          font-size: 11px;
          color: #6b7280;
          line-height: 1.85;
        }
        .header-right .person {
          font-size: 13px;
          font-weight: 700;
          color: #1a3d2b;
          display: block;
        }
        .header-right .role {
          font-size: 11px;
          color: #4b5563;
          display: block;
          margin-bottom: 5px;
        }

        /* ── Titelbalk ── */
        .title-block {
          background: #f0fdf4;
          border-left: 5px solid #2d6a4f;
          padding: 14px 18px;
          margin-bottom: 22px;
          border-radius: 0 8px 8px 0;
        }
        .title-block .report-title {
          font-size: 19px;
          font-weight: 700;
          color: #1a3d2b;
          line-height: 1.3;
        }
        .title-block .report-date {
          font-size: 11px;
          color: #6b7280;
          margin-top: 3px;
        }

        /* ── Klantkaart ── */
        .client-card {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 24px;
          background: white;
        }
        .client-field {
          padding: 11px 15px;
          border-right: 1px solid #d1fae5;
        }
        .client-field:last-child { border-right: none; }
        .client-field:nth-child(n+4) { border-top: 1px solid #d1fae5; }
        .client-field label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #2d6a4f;
          margin-bottom: 3px;
        }
        .client-field p {
          font-size: 13px;
          color: #1f2937;
          font-weight: 500;
        }

        /* ── Secties ── */
        .section { margin-bottom: 22px; }
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .section-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #2d6a4f;
          flex-shrink: 0;
        }
        .section-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #2d6a4f;
        }
        .section-line {
          flex: 1;
          height: 1px;
          background: #d1fae5;
        }
        .section-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.75;
          white-space: pre-wrap;
          padding-left: 16px;
        }

        /* ── Actiepunten ── */
        .action-list { list-style: none; padding-left: 16px; }
        .action-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 6px;
          font-size: 13px;
          color: #374151;
        }
        .action-check {
          width: 15px; height: 15px;
          border: 1.5px solid #2d6a4f;
          border-radius: 4px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ── Vervolgafspraak ── */
        .followup-box {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 22px;
        }
        .followup-icon {
          width: 36px; height: 36px;
          background: #2d6a4f;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
        }
        .followup-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #2d6a4f;
          margin-bottom: 2px;
        }
        .followup-date {
          font-size: 14px;
          font-weight: 600;
          color: #1a3d2b;
        }

        /* ── Foto's ── */
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding-left: 16px;
        }
        .photo-item img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 36px;
          padding-top: 16px;
          border-top: 1px solid #d1fae5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-logo { height: 26px; width: auto; opacity: 0.6; }
        .footer-text { font-size: 11px; color: #9ca3af; text-align: right; }

        /* ── Knoppen (niet printen) ── */
        .no-print {
          position: fixed;
          top: 20px; right: 24px;
          display: flex; gap: 8px;
          z-index: 100;
        }
        .btn-close {
          background: white; border: 1px solid #d1d5db;
          border-radius: 8px; padding: 8px 16px;
          font-size: 14px; font-weight: 500; color: #374151;
          cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .btn-print {
          background: #2d6a4f; border: none;
          border-radius: 8px; padding: 8px 16px;
          font-size: 14px; font-weight: 500; color: white;
          cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* ── Print media ── */
        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .page { padding: 18px 36px 28px; }
          .border-top, .border-bottom, .border-left, .border-right {
            position: fixed;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .watermark {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .title-block, .followup-box, .client-card {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .footer { break-before: avoid; page-break-before: avoid; }
          .section, .client-card, .followup-box { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <PrintActions />

      {/* Groene rand rondom de pagina */}
      <div className="border-top" />
      <div className="border-bottom" />
      <div className="border-left" />
      <div className="border-right" />

      {/* Groot vaag logo als watermark */}
      <div className="watermark" />

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Agrobeus Consulting" className="logo" />
            <div className="doc-type">Bezoekverslag</div>
          </div>
          <div className="header-right">
            <span className="person">Marco van Beusichem</span>
            <span className="role">Internationaal Fruitconsultant · Advies in Fruitteelt</span>
            Hoofdstraat 49, 4041 AB Kesteren<br />
            +31 6 54950432 · info@agrobeus.com<br />
            www.agrobeus.com
          </div>
        </div>

        {/* Titel */}
        <div className="title-block">
          <div className="report-title">{visit.title}</div>
          <div className="report-date">Aangemaakt op {now}</div>
        </div>

        {/* Klantgegevens */}
        <div className="client-card">
          <div className="client-field">
            <label>Bedrijf</label>
            <p>{visit.customer.companyName}</p>
          </div>
          <div className="client-field">
            <label>Contactpersoon</label>
            <p>{visit.customer.contactName}</p>
          </div>
          <div className="client-field">
            <label>Datum</label>
            <p style={{ textTransform: 'capitalize' }}>{formattedDate}</p>
          </div>
          <div className="client-field">
            <label>Tijd</label>
            <p>{visit.visitTime} uur</p>
          </div>
          {visit.customer.address && (
            <div className="client-field">
              <label>Adres</label>
              <p>{visit.customer.address}</p>
            </div>
          )}
          {visit.customer.cropType && visit.customer.cropType !== '-' && (
            <div className="client-field">
              <label>Gewas</label>
              <p>{visit.customer.cropType}</p>
            </div>
          )}
        </div>

        {/* Verslag */}
        <div className="section">
          <div className="section-header">
            <div className="section-dot" />
            <div className="section-title">Verslag</div>
            <div className="section-line" />
          </div>
          <div className="section-content">{visit.report}</div>
        </div>

        {/* Advies */}
        {visit.advice && (
          <div className="section">
            <div className="section-header">
              <div className="section-dot" />
              <div className="section-title">Advies</div>
              <div className="section-line" />
            </div>
            <div className="section-content">{visit.advice}</div>
          </div>
        )}

        {/* Actiepunten */}
        {visit.actionPoints && (
          <div className="section">
            <div className="section-header">
              <div className="section-dot" />
              <div className="section-title">Actiepunten</div>
              <div className="section-line" />
            </div>
            <ul className="action-list">
              {visit.actionPoints.split('\n').filter(Boolean).map((point, i) => (
                <li key={i}>
                  <div className="action-check" />
                  <span>{point.replace(/^[-•]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vervolgafspraak */}
        {visit.followUpDate && (
          <div className="followup-box">
            <div className="followup-icon">📅</div>
            <div>
              <div className="followup-label">Vervolgafspraak</div>
              <div className="followup-date">
                {new Date(visit.followUpDate).toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}

        {/* Foto's */}
        {visit.photos && visit.photos.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-dot" />
              <div className="section-title">Foto&apos;s</div>
              <div className="section-line" />
            </div>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Agrobeus Consulting" className="footer-logo" />
          <div className="footer-text">
            {visit.customer.companyName} &bull; {visit.visitDate}
          </div>
        </div>

      </div>
    </>
  )
}
