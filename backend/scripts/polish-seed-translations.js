const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const propertyTranslations = {
  'Tour biển Quan Lạn 2 ngày 1 đêm': {
    nameEn: 'Quan Lan beach tour 2 days 1 night',
    descriptionEn: 'A short package tour for friends and families planning a weekend trip.',
    amenitiesEn: ['Electric shuttle', '3 meals included', 'Tour guide'],
  },
  'Quan Lạn Eco Stay': {
    nameEn: 'Quan Lan Eco Stay',
    descriptionEn: 'A local-style homestay for guests who want privacy and easy beach access.',
    amenitiesEn: ['Wi-Fi', 'Bicycles', 'BBQ'],
  },
  'Tour trải nghiệm biển Cô Tô': {
    nameEn: 'Co To island experience tour',
    descriptionEn: 'An itinerary covering rocky beaches, swimming spots, and local seafood experiences.',
    amenitiesEn: ['Tour guide', 'Lunch'],
  },
  'Khách sạn Cô Tô Sunrise': {
    nameEn: 'Co To Sunrise Hotel',
    descriptionEn: 'A beachside hotel suited for couples, small groups, and summer stays in Co To.',
    amenitiesEn: ['Wi-Fi', 'Electric shuttle', 'Breakfast included'],
  },
  'Combo khách sạn trung tâm Hạ Long': {
    nameEn: 'Central Ha Long hotel package',
    descriptionEn: 'A central hotel package with easy access to the harbor, night market, and Ha Long attractions.',
    amenitiesEn: ['Wi-Fi', 'Breakfast included', 'Transfer'],
  },
  'Du thuyền Paradise Elegance': {
    nameEn: 'Paradise Elegance Cruise',
    descriptionEn: 'A premium overnight Ha Long Bay cruise for couples and small families.',
    amenitiesEn: ['Wi-Fi', 'Restaurant', 'Bar', 'Kayaking', 'Spa'],
  },
  'Tour Vịnh Lan Hạ 1 ngày': {
    nameEn: 'Lan Ha Bay day tour',
    descriptionEn: 'A speedboat and boat tour through Lan Ha Bay with kayaking and lunch on the bay.',
    amenitiesEn: ['Tour guide', 'Lunch', 'Kayak'],
  },
  'Flamingo Cát Bà Beach Resort': {
    nameEn: 'Flamingo Cat Ba Beach Resort',
    descriptionEn: 'A beachfront resort suited for families and weekend getaways in Cat Ba.',
    amenitiesEn: ['Wi-Fi', 'Swimming pool', 'Restaurant', 'Spa'],
  },
};

const locationTranslations = {
  'Hạ Long': 'Ha Long',
  'Cát Bà': 'Cat Ba',
  'Cô Tô': 'Co To',
  'Quan Lạn': 'Quan Lan',
};

const categoryTranslations = {
  'Khách sạn': 'Hotel',
  Homestay: 'Homestay',
  Tour: 'Tour',
  'Du thuyền': 'Cruise',
  'Thuê xe': 'Car rental',
  Trekking: 'Trekking',
};

async function main() {
  for (const [name, en] of Object.entries(locationTranslations)) {
    await prisma.location.updateMany({
      where: { name },
      data: {
        nameVi: name,
        nameEn: en,
        seoTitleVi: `${name} | An Voyages`,
        seoTitleEn: `${en} | An Voyages`,
        seoDescriptionEn: `Plan tours, cruises, hotels, and travel packages in ${en} with An Voyages.`,
      },
    });
  }

  for (const [name, en] of Object.entries(categoryTranslations)) {
    await prisma.productCategory.updateMany({
      where: { name },
      data: { nameVi: name, nameEn: en },
    });
  }

  for (const [name, data] of Object.entries(propertyTranslations)) {
    await prisma.property.updateMany({
      where: { name },
      data: {
        nameVi: name,
        nameEn: data.nameEn,
        descriptionEn: data.descriptionEn,
        amenitiesEn: JSON.stringify(data.amenitiesEn),
        seoTitleEn: `${data.nameEn} | An Voyages`,
        seoDescriptionEn: data.descriptionEn.slice(0, 160),
        seoKeywordsEn: `${data.nameEn}, Northern Vietnam travel, An Voyages`,
      },
    });
  }

  console.log('Polished seed translations.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
