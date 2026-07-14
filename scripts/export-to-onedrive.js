#!/usr/bin/env node

/**
 * export-to-onedrive.js
 *
 * Exporteert afgeronde bezoeken als PDF naar OneDrive.
 * Draait automatisch via launchd.
 *
 * Gebruik: node export-to-onedrive.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')

// ── Instellingen ─────────────────────────────────────────────
const APP_URL = 'https://agrobeus.vercel.app'
const ONEDRIVE_FOLDER = '/Users/marcovanbeusichem/Library/CloudStorage/OneDrive-Persoonlijk/Werk/Agrobeus Consulting/Klanten/Klantenbezoeken'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const EXPORTED_FILE = path.join(__dirname, '.exported-visits.json')
const LOG_FILE = path.join(__dirname, 'export.log')
// ─────────────────────────────────────────────────────────────

function log(msg) {
  const line = `[${new Date().toLocaleString('nl-NL')}] ${msg}`
  console.log(line)
  fs.appendFileSync(LOG_FILE, line + '\n')
}

function sanitize(str) {
  return (str || '')
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/[._]+$/, '') // geen punt/underscore aan het eind (ongeldig in OneDrive)
    .slice(0, 60)
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)) }
      })
    }).on('error', reject)
  })
}

function loadExported() {
  if (!fs.existsSync(EXPORTED_FILE)) return {}
  try { return JSON.parse(fs.readFileSync(EXPORTED_FILE, 'utf8')) }
  catch { return {} }
}

function saveExported(data) {
  fs.writeFileSync(EXPORTED_FILE, JSON.stringify(data, null, 2))
}

async function generatePdf(visitId, outputPath) {
  const printUrl = `${APP_URL}/visits/${visitId}/print`
  const cmd = [
    `"${CHROME}"`,
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    '--no-pdf-header-footer',
    `--print-to-pdf="${outputPath}"`,
    `"${printUrl}"`,
  ].join(' ')

  execSync(cmd, { timeout: 120000 })
}

async function main() {
  log('─── Export gestart ───')

  // OneDrive map controleren
  if (!fs.existsSync(ONEDRIVE_FOLDER)) {
    log(`FOUT: OneDrive map niet gevonden: ${ONEDRIVE_FOLDER}`)
    process.exit(1)
  }

  // Haal alle bezoeken op (concept, verzonden én afgerond)
  let visits
  try {
    visits = await fetchJson(`${APP_URL}/api/visits`)
  } catch (err) {
    log(`FOUT bij ophalen bezoeken: ${err.message}`)
    process.exit(1)
  }

  if (!Array.isArray(visits)) {
    log('FOUT: Onverwacht antwoord van API')
    process.exit(1)
  }

  log(`${visits.length} bezoek(en) gevonden`)

  const exported = loadExported()
  let newCount = 0

  for (const visit of visits) {
    const entry = exported[visit.id]

    // Overslaan als al geëxporteerd en niet gewijzigd sindsdien
    if (entry) {
      const upToDate = entry.updatedAt
        ? entry.updatedAt === visit.updatedAt
        : !visit.updatedAt || new Date(visit.updatedAt) <= new Date(entry.exportedAt)
      if (upToDate) continue
    }

    const status = visit.status || 'concept'
    const suffix = status === 'afgerond' ? '' : `_${status.toUpperCase()}`
    const date = visit.visitDate || 'onbekend'
    const company = sanitize(visit.customer?.companyName || 'Onbekend')
    const title = sanitize(visit.title || 'Bezoek')
    let filename = `${date}_${title}${suffix}.pdf`

    // Botsingsbeveiliging: als een ánder bezoek deze bestandsnaam al gebruikt,
    // voeg de bezoektijd toe zodat beide PDF's blijven bestaan
    const claimedByOther = Object.entries(exported).some(
      ([id, e]) => id !== visit.id && e && e.company === visit.customer?.companyName && e.filename === filename
    )
    if (claimedByOther) {
      const time = (visit.visitTime || '').replace(':', '.')
      filename = `${date}_${title}${time ? '_' + time : '_2'}${suffix}.pdf`
    }

    // Oude versie opruimen (bijv. concept-PDF na afronden, of gewijzigde titel)
    if (entry && entry.filename) {
      const oldPath = path.join(ONEDRIVE_FOLDER, sanitize(entry.company || ''), entry.filename)
      if (oldPath !== path.join(ONEDRIVE_FOLDER, company, filename) && fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); log(`  Oude versie verwijderd: ${entry.filename}`) }
        catch (e) { log(`  Kon oude versie niet verwijderen: ${e.message}`) }
      }
    }

    // Klantmap aanmaken indien nodig
    const customerFolder = path.join(ONEDRIVE_FOLDER, company)
    if (!fs.existsSync(customerFolder)) {
      fs.mkdirSync(customerFolder, { recursive: true })
      log(`Map aangemaakt: ${company}`)
    }

    const outputPath = path.join(customerFolder, filename)
    log(`Exporteren: ${company}/${filename}`)

    try {
      await generatePdf(visit.id, outputPath)

      // Controleer of bestand aangemaakt is
      if (!fs.existsSync(outputPath)) {
        throw new Error('PDF bestand niet aangemaakt')
      }

      const size = fs.statSync(outputPath).size
      if (size < 1000) {
        throw new Error(`PDF lijkt leeg (${size} bytes)`)
      }

      exported[visit.id] = {
        filename,
        exportedAt: new Date().toISOString(),
        updatedAt: visit.updatedAt,
        status,
        visitDate: visit.visitDate,
        company: visit.customer?.companyName,
      }
      saveExported(exported)
      log(`  ✓ Opgeslagen (${Math.round(size / 1024)} KB)`)
      newCount++
    } catch (err) {
      log(`  ✗ Fout: ${err.message}`)
    }
  }

  if (newCount === 0) {
    log('Geen nieuwe bezoeken om te exporteren')
  } else {
    log(`${newCount} nieuw(e) PDF('s) opgeslagen in OneDrive`)
  }

  log('─── Export klaar ───')
}

main().catch((err) => {
  log(`FATALE FOUT: ${err.message}`)
  process.exit(1)
})
