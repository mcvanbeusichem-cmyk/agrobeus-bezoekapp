"""Genereert de QR-code met de vCard als losse SVG.

    python3 design/visitekaartje/maak-qr.py

De SVG gaat daarna tussen <div class="qr-doos"> in digitaal-visitekaartje.html.
Pas eerst VCARD hieronder aan als de gegevens wijzigen.
"""
import qrcode

VCARD = "\r\n".join([
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:van Beusichem;Marco;;;",
    "FN:Marco van Beusichem",
    "ORG:Agrovitae",
    "TITLE:Internationaal fruitconsultant",
    "TEL;TYPE=CELL:+31654950432",
    "EMAIL:info@agrovitae.nl",
    "URL:https://www.agrovitae.nl",
    "END:VCARD",
    "",
])

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1, box_size=1)
qr.add_data(VCARD)
qr.make(fit=True)
m = qr.get_matrix()
n = len(m)

paden = []
for y, rij in enumerate(m):
    x = 0
    while x < n:
        if rij[x]:
            start = x
            while x < n and rij[x]:
                x += 1
            paden.append(f"M{start} {y}h{x - start}v1h-{x - start}z")
        else:
            x += 1

svg = (
    f'<svg viewBox="0 0 {n} {n}" xmlns="http://www.w3.org/2000/svg" '
    f'role="img" aria-label="QR-code met de contactgegevens van Marco van Beusichem" '
    f'shape-rendering="crispEdges"><rect width="{n}" height="{n}" fill="#f3f0e4"/>'
    f'<path d="{"".join(paden)}" fill="#16280f"/></svg>'
)

with open("qr-vcard.svg", "w") as f:
    f.write(svg)

print(f"QR {n}x{n} modules, {len(svg)} bytes -> qr-vcard.svg")
