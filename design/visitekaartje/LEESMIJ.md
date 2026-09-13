# Visitekaartje Agrovitae

Drukklaar ontwerp, voor- en achterkant.

## Specificaties

Snijformaat 85 x 55 mm, afloop 3 mm rondom, totaal bestand 91 x 61 mm.
Tekst en logo blijven 5 mm binnen de snijlijn, dus niets valt weg bij het snijden.
Kleuren komen uit de Agrobeus-huisstijl: diepgroen #1f3d17, groen #3a6e2d, frisgroen #65a255, zand #f7f5ef.

## Gegevens aanpassen

Open `agrovitae-visitekaartje.html` en zoek op `data-veld`. Elk veld staat er los in:
naam, functie, telefoon, email, adres, web, kvk, payoff.
De KVK-regel staat nu op `00000000` en het webadres op `www.agrovitae.nl`. Beide vervangen voor je naar de drukker gaat.

## Opnieuw renderen

```bash
npm install puppeteer-core
node design/visitekaartje/render.js
```

Dit maakt `agrovitae-visitekaartje.pdf` (2 pagina's, 91 x 61 mm) en twee PNG-previews.
Wijkt je Chromium-pad af, zet dan `CHROME_PATH` in je omgeving.

## Naar de drukker

De PDF is RGB. Vrijwel elke online drukker (Drukwerkdeal, Probo, Flyerzone) rekent dat zelf om naar CMYK.
Wil je exacte kleur, laat de drukker dan omzetten naar Coated FOGRA39 of lever zelf een CMYK-PDF aan.
Advies voor het gevoel in de hand: 400 grams, matte laminaat, enkelzijdig groen vlak op de achterkant.
Vraag altijd een drukproef aan bij de eerste bestelling.

---

# Digitaal visitekaartje

`digitaal-visitekaartje.html` is de deelbare webversie. Bellen, WhatsApp, mailen en route zijn tikbaar, de QR-code bevat de vCard.
De QR staat als losse SVG in de pagina, dus er is geen internetverbinding of externe bibliotheek nodig om hem te tonen.

Gegevens gewijzigd? Pas ze aan in `maak-qr.py`, draai `python3 design/visitekaartje/maak-qr.py` (eenmalig `pip install qrcode`) en plak de nieuwe `qr-vcard.svg` in de pagina tussen `<div class="qr-doos">`. Wijzig daarna dezelfde gegevens in de HTML zelf.

`marco-van-beusichem-agrovitae.vcf` is hetzelfde contact als los bestand, handig om als bijlage te mailen.
