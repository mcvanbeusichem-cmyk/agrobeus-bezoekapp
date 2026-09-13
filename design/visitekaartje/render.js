/**
 * Rendert het visitekaartje naar een drukklare PDF (91 x 61 mm, 2 pagina's)
 * en twee PNG-previews.
 *
 *   node design/visitekaartje/render.js
 *
 * Chromium wordt gezocht via CHROME_PATH, anders via @sparticuz/chromium.
 */
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer-core')

const MAP = __dirname
const BRON = 'file://' + path.join(MAP, 'agrovitae-visitekaartje.html')

async function chromiumPad() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const kandidaten = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ]
  for (const p of kandidaten) if (fs.existsSync(p)) return p
  const chromium = require('@sparticuz/chromium')
  return await (chromium.default || chromium).executablePath()
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: await chromiumPad(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 4 })
  await page.goto(BRON, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    width: '91mm',
    height: '61mm',
    printBackground: true,
    preferCSSPageSize: true,
  })
  fs.writeFileSync(path.join(MAP, 'agrovitae-visitekaartje.pdf'), pdf)

  const kaarten = await page.$$('.kaart')
  const namen = ['voorkant', 'achterkant']
  for (let i = 0; i < kaarten.length; i++) {
    await page.evaluate(() => {
      document.querySelectorAll('.snijlijn').forEach((el) => (el.style.display = 'none'))
    })
    await kaarten[i].screenshot({ path: path.join(MAP, `preview-${namen[i]}.png`) })
  }

  await browser.close()
  console.log('Klaar: PDF en previews staan in', MAP)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
