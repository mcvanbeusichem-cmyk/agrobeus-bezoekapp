import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintActions } from './PrintActions'

interface PrintPageProps {
  params: { id: string }
  searchParams: { pdf?: string }
}

export default async function PrintPage({ params, searchParams }: PrintPageProps) {
  const isServerPdf = searchParams.pdf === '1'
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

  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-')

  const filename = `Bezoekverslag_${visit.customer.companyName.replace(/\s+/g, '_')}_${visitDateFormatted}`

  const followUpFormatted = visit.followUpDate
    ? new Date(visit.followUpDate).toLocaleDateString('nl-NL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #1a1a1a;
          background: #fff;
        }

        /* ── Groene rand ── */
        .border-top    { position: fixed; top: 0; left: 0; right: 0; height: 6px; background: #3a7a2a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-bottom { position: fixed; bottom: 0; left: 0; right: 0; height: 6px; background: #3a7a2a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-left   { position: fixed; top: 0; left: 0; bottom: 0; width: 6px; background: #3a7a2a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .border-right  { position: fixed; top: 0; right: 0; bottom: 0; width: 6px; background: #3a7a2a; z-index: 10; print-color-adjust: exact; -webkit-print-color-adjust: exact; }

        /* ── Watermark ── */
        .watermark {
          position: fixed;
          bottom: 60px;
          right: 40px;
          width: 160px;
          height: 160px;
          background-image: url('/logo.png');
          background-size: 160px 160px;
          background-repeat: no-repeat;
          background-position: center top;
          opacity: 0.06;
          pointer-events: none;
          z-index: 0;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        /* ── Pagina ── */
        .page {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 0 auto;
          padding: 24px 44px 32px;
        }

        /* ── Header ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          margin-bottom: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 18px;
          border-bottom: 2px solid #3a7a2a;
          flex: 1;
        }
        .header-left .logo {
          height: 58px;
          width: auto;
          display: block;
          flex-shrink: 0;
        }
        .header-divider {
          width: 1px;
          background: #d0e8c8;
          align-self: stretch;
          margin: 4px 0;
        }
        .header-meta {
          font-size: 10px;
          color: #4a6a3a;
          line-height: 1.6;
        }
        .header-meta .doc-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #3a7a2a;
          margin-bottom: 2px;
        }
        .header-right {
          text-align: right;
          padding-bottom: 18px;
          border-bottom: 2px solid #3a7a2a;
          padding-left: 24px;
        }
        .header-right .person {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          display: block;
          letter-spacing: 0.3px;
        }
        .header-right .role {
          font-size: 9.5px;
          color: #4a6a3a;
          display: block;
          margin-bottom: 6px;
          font-style: italic;
        }
        .header-right .contact {
          font-size: 9.5px;
          color: #666;
          line-height: 1.7;
        }

        /* ── Titel sectie ── */
        .title-section {
          margin: 22px 0 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e8f0e4;
        }
        .title-section .visit-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a2a14;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .title-section .visit-meta {
          margin-top: 6px;
          font-size: 11px;
          color: #6a8a5a;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title-section .visit-meta .sep {
          color: #c0d8b0;
        }

        /* ── Klantkaart ── */
        .client-card {
          background: #f7fbf4;
          border: 1px solid #d0e8c0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 22px;
        }
        .client-card-header {
          background: #3a7a2a;
          padding: 7px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .client-card-header span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
        }
        .client-card-header .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
        }
        .client-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .client-field {
          padding: 10px 14px;
          border-right: 1px solid #e0f0d8;
          border-bottom: 1px solid #e0f0d8;
        }
        .client-field:nth-child(even) { border-right: none; }
        .client-field:nth-last-child(-n+2) { border-bottom: none; }
        .client-field:last-child:nth-child(odd) { border-bottom: none; grid-column: span 2; }
        .client-field label {
          display: block;
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #3a7a2a;
          margin-bottom: 3px;
        }
        .client-field p {
          font-size: 12.5px;
          color: #1a1a1a;
          font-weight: 500;
        }

        /* ── Secties ── */
        .section { margin-bottom: 20px; }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e0eed8;
        }
        .section-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #3a7a2a;
          white-space: nowrap;
        }
        .section-content {
          font-size: 12.5px;
          color: #333;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        /* ── Actiepunten ── */
        .action-list { list-style: none; }
        .action-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 7px;
          font-size: 12.5px;
          color: #333;
          line-height: 1.5;
        }
        .action-check {
          width: 13px; height: 13px;
          border: 1.5px solid #3a7a2a;
          border-radius: 3px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ── Vervolgafspraak ── */
        .followup-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f0fae8;
          border-left: 4px solid #3a7a2a;
          border-radius: 0 6px 6px 0;
          padding: 12px 16px;
          margin-bottom: 20px;
        }
        .followup-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #3a7a2a;
          margin-bottom: 3px;
        }
        .followup-date {
          font-size: 13px;
          font-weight: 600;
          color: #1a2a14;
          text-transform: capitalize;
        }

        /* ── Foto's ── */
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .photo-item img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ddeedd;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 32px;
          padding-top: 12px;
          border-top: 1px solid #d8ecd0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo { height: 22px; width: auto; opacity: 0.5; }
        .footer-brand {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #8aaa7a;
        }
        .footer-text {
          font-size: 9.5px;
          color: #aaa;
          text-align: right;
          line-height: 1.6;
        }

        /* ── Knoppen ── */
        .no-print {
          position: fixed;
          top: 20px; right: 24px;
          display: flex; gap: 8px;
          z-index: 100;
        }
        .btn-close {
          background: white; border: 1px solid #d1d5db;
          border-radius: 6px; padding: 8px 16px;
          font-size: 13px; font-weight: 500; color: #555;
          cursor: pointer;
        }
        .btn-print {
          background: #3a7a2a; border: none;
          border-radius: 6px; padding: 8px 18px;
          font-size: 13px; font-weight: 600; color: white;
          cursor: pointer;
        }

        /* ── Print ── */
        @page { margin: ${isServerPdf ? '0' : '0 0 12mm 0'}; }

        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .page { padding: 20px 40px 28px; }
          .border-top, .border-bottom, .border-left, .border-right,
          .watermark, .client-card, .client-card-header,
          .followup-box, .title-section {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .footer { break-before: avoid; page-break-before: avoid; }
          .client-card, .followup-box { break-inside: avoid; page-break-inside: avoid; }
          .section-header { break-after: avoid; page-break-after: avoid; }
          .photo-item img { max-width: 180px !important; max-height: 180px !important; width: 180px !important; height: 180px !important; }
        }
      `}</style>

      <PrintActions filename={filename} />

      <div className="border-top" />
      <div className="border-bottom" />
      <div className="border-left" />
      <div className="border-right" />
      <div className="watermark" />

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Agrobeus Consulting" className="logo" />
            <div className="header-divider" />
            <div className="header-meta">
              <div className="doc-label">Bezoekverslag</div>
              Fruitteelt &amp; Tuinbouw Consultancy
            </div>
          </div>
          <div className="header-right">
            <span className="person">Marco van Beusichem</span>
            <span className="role">Internationaal Fruitconsultant &middot; Advies in Fruitteelt</span>
            <div className="contact">
              Hoofdstraat 49, 4041 AB Kesteren<br />
              +31 6 54950432 &nbsp;&middot;&nbsp; info@agrobeus.com<br />
              www.agrobeus.com
            </div>
          </div>
        </div>

        {/* Titel */}
        <div className="title-section">
          <div className="visit-title">{visit.title}</div>
          <div className="visit-meta">
            <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
            <span className="sep">&bull;</span>
            <span>{visit.customer.companyName}</span>
            <span className="sep">&bull;</span>
            <span>{visit.visitTime} uur</span>
          </div>
        </div>

        {/* Klantgegevens */}
        <div className="client-card">
          <div className="client-card-header">
            <div className="dot" />
            <span>Klantgegevens</span>
          </div>
          <div className="client-fields">
            <div className="client-field">
              <label>Bedrijf</label>
              <p>{visit.customer.companyName}</p>
            </div>
            <div className="client-field">
              <label>Contactpersoon</label>
              <p>{visit.customer.contactName}</p>
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
        </div>

        {/* Verslag */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Verslag</div>
          </div>
          <div className="section-content">{visit.report}</div>
        </div>

        {/* Advies */}
        {visit.advice && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Advies</div>
            </div>
            <div className="section-content">{visit.advice}</div>
          </div>
        )}

        {/* Actiepunten */}
        {visit.actionPoints && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Actiepunten</div>
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
        {followUpFormatted && (
          <div className="followup-box">
            <div>
              <div className="followup-label">Vervolgafspraak</div>
              <div className="followup-date">{followUpFormatted}</div>
            </div>
          </div>
        )}

        {/* Foto's */}
        {visit.photos && visit.photos.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Foto&apos;s</div>
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
          <div className="footer-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Agrobeus" className="footer-logo" />
            <span className="footer-brand">Agrobeus Consulting</span>
          </div>
          <div className="footer-text">
            {visit.customer.companyName} &bull; {formattedDate}<br />
            Aangemaakt op {now}
          </div>
        </div>

      </div>
    </>
  )
}
