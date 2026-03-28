# Agrobeus BezoekApp

Mobiele webapp voor klantenbeheer en bezoekregistratie.
Gebouwd voor gebruik op iPhone in het veld.

## Stack

- **Next.js 14** – App Router, Server Components
- **TypeScript** – type-safe code
- **Tailwind CSS** – mobile-first styling
- **Prisma** – ORM
- **SQLite** – lokale database (later uitbreidbaar naar PostgreSQL)

---

## Installatie

### 1. Vereisten

Installeer eerst [Node.js](https://nodejs.org) (versie 18 of hoger).

Controleer:
```bash
node --version   # moet 18+ zijn
npm --version
```

### 2. Project instellen

```bash
# Navigeer naar de projectmap
cd agrobeus-bezoekapp

# Installeer dependencies
npm install
```

### 3. Database initialiseren

```bash
# Maak de database aan op basis van het Prisma schema
npm run db:push
```

### 4. Seed data laden (testklanten + bezoeken)

```bash
npm run db:seed
```

Dit laadt 3 klanten en 5 bezoeken als startdata.

### 5. Lokaal starten

```bash
npm run dev
```

Open de app op [http://localhost:3000](http://localhost:3000).

**Op iPhone testen:** gebruik je lokale IP-adres, bijv. `http://192.168.1.x:3000`

---

## Handige commando's

| Commando | Functie |
|---|---|
| `npm run dev` | Lokale ontwikkelserver starten |
| `npm run build` | Productie build maken |
| `npm run start` | Productie server starten |
| `npm run db:push` | Database schema synchroniseren |
| `npm run db:seed` | Testdata laden |
| `npm run db:reset` | Database leegmaken + opnieuw seeden |
| `npm run db:studio` | Prisma Studio openen (database GUI) |

---

## E-mail instellen

De e-mailfunctie staat nu op placeholder (logt naar console).
Om echte e-mails te versturen:

### Optie A: Resend (aanbevolen)

```bash
npm install resend
```

Voeg toe aan `.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
MAIL_FROM=marco@agrobeusconsulting.nl
```

Uncomment de Resend code in `src/lib/email.ts`.

### Optie B: Nodemailer (via Gmail / SMTP)

```bash
npm install nodemailer @types/nodemailer
```

---

## Op iPhone zetten als app

1. Open de app in Safari op je iPhone
2. Tik op het deelicoon (vierkantje met pijl omhoog)
3. Kies "Zet op beginscherm"
4. Geef de naam "Agrobeus" en tik op "Voeg toe"

De app werkt dan als een echte app zonder adresbalk.

---

## Database wisselen naar PostgreSQL

1. Wijzig in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Pas `.env` aan:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/agrobeus"
   ```

3. Voer uit:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## Uitbreidingsmogelijkheden

De app is voorbereid op:

- **Authenticatie** – login/auth via NextAuth.js of Clerk
- **Foto's** – bezoekfoto's opslaan (S3 / Cloudflare R2)
- **PDF-export** – verslag exporteren als PDF
- **GPS-locatie** – locatie vastleggen bij bezoek
- **Offline opslag** – concepten offline opslaan (PWA + Service Worker)
- **Handtekening** – digitale handtekening toevoegen

---

## Projectstructuur

```
src/
├── app/                    # Next.js App Router pagina's
│   ├── page.tsx            # Dashboard
│   ├── customers/          # Klantenbeheer
│   ├── visits/             # Bezoeken
│   └── api/                # API endpoints
├── components/
│   ├── layout/             # MobileNav, PageHeader
│   ├── customers/          # CustomerCard, CustomerForm
│   ├── visits/             # VisitCard, VisitForm
│   └── ui/                 # Button, Badge, EmptyState
├── lib/
│   ├── prisma.ts           # Database client
│   └── email.ts            # E-mail service
└── types/
    └── index.ts            # TypeScript types
```

---

## Contact

Agrobeus Consulting
Ontwikkeld voor intern gebruik
