import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed data aanmaken...')

  // Verwijder bestaande data
  await prisma.visit.deleteMany()
  await prisma.customer.deleteMany()

  // Klant 1 – Appelteler
  const klant1 = await prisma.customer.create({
    data: {
      companyName: 'Fruitbedrijf De Hoogaard',
      contactName: 'Jan de Vries',
      email: 'jan@hoogaard.nl',
      phone: '0313-456789',
      address: 'Fruitlaan 14, 6674 BD Herveld',
      cropType: 'Appels (Elstar, Jonagold)',
      hectares: 42.5,
      notes: 'Voorkeur voor biologische gewasbescherming. Lid van BioNext.',
    },
  })

  // Klant 2 – Perenteler
  const klant2 = await prisma.customer.create({
    data: {
      companyName: 'Gebroeders Willemsen BV',
      contactName: 'Pieter Willemsen',
      email: 'pieter@willemsen-fruit.nl',
      phone: '0344-612345',
      address: 'Randwijkse Rijndijk 88, 6668 MC Randwijk',
      cropType: 'Peren (Conference, Doyenné du Comice)',
      hectares: 28.0,
      notes: 'Wil uitbreiden met nieuwe Conference percelen in 2026. Afspraak met Rabobank loopt.',
    },
  })

  // Klant 3 – Aardbeiteler
  const klant3 = await prisma.customer.create({
    data: {
      companyName: 'Aardbeikwekerij Van den Berg',
      contactName: 'Marieke van den Berg',
      email: 'marieke@aardbeivandenberg.nl',
      phone: '0481-234567',
      address: 'Nieuweweg 3, 4024 EC Eck en Wiel',
      cropType: 'Aardbeien (Elsanta, Sonata)',
      hectares: 8.5,
      notes: 'Teelt onder tunnels. Interesse in substraatteelt uitbreiden.',
    },
  })

  // Bezoeken klant 1
  await prisma.visit.create({
    data: {
      customerId: klant1.id,
      visitDate: '2026-03-10',
      visitTime: '09:30',
      title: 'Schurftpreventie voorjaar 2026',
      report:
        'Boomgaard geïnspecteerd na de winter. Knopstadium fase C/C3. Besproken dat schurftdruk dit jaar hoog kan zijn vanwege vochtige winter. Eerste bespuiting gepland.',
      advice:
        'Start preventief spuiten bij knopstadium D. Gebruik Captan als basis, aangevuld met Merpan. Controleer weersverwachting voor infectieperiodes via RIMpro.',
      actionPoints:
        '- Jan bestelt Captan voor einde week\n- Spuitplan aanpassen voor perceel Oost\n- Volgende meting infectiedruk op 18 maart',
      followUpDate: '2026-03-25',
      status: 'verzonden',
      emailedAt: new Date('2026-03-10T11:45:00'),
    },
  })

  await prisma.visit.create({
    data: {
      customerId: klant1.id,
      visitDate: '2026-01-22',
      visitTime: '14:00',
      title: 'Snoei-advies en sortimentsbespreking',
      report:
        'Rondgang gemaakt door percelen Noord en Zuid. Snoei is voor 60% afgerond. Gesprek gehad over het uitfaseren van Cox Orange perceel (5 ha) en vervanging door Kanzi.',
      advice:
        'Cox Orange perceel heeft nog 3-4 jaar economische levensduur. Overweeg gefaseerde omschakeling naar Kanzi Club. Contacteer Fruitmasters voor informatie over toetreding.',
      actionPoints:
        '- Jan vraagt offerte op bij Fruitmasters\n- Bespreking met bank over financiering herplant\n- Snoei afronden voor 15 februari',
      followUpDate: '2026-02-15',
      status: 'afgerond',
      emailedAt: new Date('2026-01-22T16:30:00'),
    },
  })

  // Bezoeken klant 2
  await prisma.visit.create({
    data: {
      customerId: klant2.id,
      visitDate: '2026-03-18',
      visitTime: '10:00',
      title: 'Bewaarresultaten + planning nieuwe percelen',
      report:
        'Besproken hoe de bewaarresultaten van Conference 2025 zijn. Gemiddeld goed, wel wat vlekjes in partij B (koelcel 3). Aanvang besproken van nieuw aanplantproject.',
      advice:
        'Partij B zo snel mogelijk afzetten. Voor nieuwe percelen: kies voor onderstam Quince Adams, rij-afstand 3,5m. Grondonderzoek laten uitvoeren voor de aanvang van de aanplant.',
      actionPoints:
        '- Grondmonsters laten nemen perceel West\n- Offerte opvragen boomkwekerij\n- Pieter stuurt oogstregistratie door',
      followUpDate: '2026-04-10',
      status: 'concept',
    },
  })

  await prisma.visit.create({
    data: {
      customerId: klant2.id,
      visitDate: '2025-11-05',
      visitTime: '09:00',
      title: 'Oogstevaluatie 2025 + bewaarstrategie',
      report:
        'Nabesproken seizoen 2025. Totale opbrengst 1.240 ton Conference, iets onder verwachting door droge zomer. Bewaarstrategie besproken: CA-bewaring aanbevolen voor klasse I.',
      advice:
        'CA-bewaring inzetten voor minimaal 70% van de klasse I partij. Klasse II snel afzetten. Overweeg exportmarkt Scandinavië te benaderen via BelOrta.',
      actionPoints:
        '- Contact opnemen met BelOrta exportdesk\n- Bewaarprotocol instellen koelcel 1 en 2\n- Pieter stuurt klimaatgegevens door',
      followUpDate: '2025-11-20',
      status: 'afgerond',
      emailedAt: new Date('2025-11-05T12:00:00'),
    },
  })

  // Bezoek klant 3
  await prisma.visit.create({
    data: {
      customerId: klant3.id,
      visitDate: '2026-02-28',
      visitTime: '11:00',
      title: 'Plantklaarmaak tunnels + ziektedruk verwachting',
      report:
        'Tunnels geïnspecteerd. Plastic vernieuwd op tunnel 2 en 3. Grondbedekking in goede staat. Besproken dat nieuwe Sonata-planten volgende week aankomen.',
      advice:
        'Start met preventief spuiten tegen Botrytis bij 10% bloei. Zorg voor goede luchtvochtigheidsbeheersing in de tunnels. Gebruik Teldor of Switch als fungicide.',
      actionPoints:
        '- Marieke bestelt Teldor\n- Irrigatieschema aanpassen na plantdatum\n- Thermometrie installeren in tunnel 1',
      followUpDate: '2026-03-20',
      status: 'verzonden',
      emailedAt: new Date('2026-02-28T14:00:00'),
    },
  })

  console.log('Seed data aangemaakt:')
  console.log('  - 3 klanten')
  console.log('  - 5 bezoeken')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
