import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const publicImage = (name: string) => `/api/media/files/products/${name}`;

const commonImages = [
  'cat-ba-eco-hotel/khu-vuc-chung-1.jpg',
  'cat-ba-eco-hotel/khu-vuc-chung-2.jpg',
  'cat-ba-eco-hotel/nha-hang-1.jpg',
  'cat-ba-eco-hotel/nha-hang-2.jpg',
].map(publicImage);

type RoomRate = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  standardGuests: number;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  bedCount: number;
  low: number;
  high: number;
  peakWeekday: number;
  peakWeekend: number;
  inventoryQuantity: number;
};

const rooms: RoomRate[] = [
  {
    slug: 'phong-thong-gia-dinh-tang-cao-view-nui',
    nameVi: 'Phòng thông gia đình tầng cao view núi',
    nameEn: 'High-floor family duplex mountain-view room',
    descriptionVi: 'Phòng thông tầng rộng cho gia đình hoặc nhóm bạn, view núi, đã bao gồm bữa sáng buffet và tiện ích phòng tiêu chuẩn.',
    descriptionEn: 'Spacious duplex family room for families or groups, mountain view, buffet breakfast and standard in-room amenities included.',
    standardGuests: 6,
    maxGuests: 7,
    maxAdults: 7,
    maxChildren: 2,
    bedType: 'Family duplex',
    bedCount: 3,
    low: 1900000,
    high: 2100000,
    peakWeekday: 2700000,
    peakWeekend: 3200000,
    inventoryQuantity: 3,
  },
  {
    slug: '2-giuong-doi-ban-cong-view-nui',
    nameVi: '2 giường đôi ban công view núi',
    nameEn: 'Two double beds with balcony and mountain view',
    descriptionVi: 'Phòng 2 giường đôi có ban công hướng núi, phù hợp gia đình nhỏ hoặc nhóm 4 khách.',
    descriptionEn: 'Two-double-bed room with balcony and mountain view, suitable for small families or groups of four.',
    standardGuests: 4,
    maxGuests: 5,
    maxAdults: 5,
    maxChildren: 2,
    bedType: 'Two double beds',
    bedCount: 2,
    low: 1000000,
    high: 1200000,
    peakWeekday: 1500000,
    peakWeekend: 1850000,
    inventoryQuantity: 5,
  },
  {
    slug: '2-giuong-doi-view-nui',
    nameVi: '2 giường đôi view núi',
    nameEn: 'Two double beds mountain-view room',
    descriptionVi: 'Phòng 2 giường đôi view núi, giá rõ theo mùa, đã bao gồm bữa sáng buffet.',
    descriptionEn: 'Two-double-bed mountain-view room with seasonal rates and buffet breakfast included.',
    standardGuests: 4,
    maxGuests: 5,
    maxAdults: 5,
    maxChildren: 2,
    bedType: 'Two double beds',
    bedCount: 2,
    low: 900000,
    high: 1100000,
    peakWeekday: 1400000,
    peakWeekend: 1750000,
    inventoryQuantity: 8,
  },
  {
    slug: '2-giuong-doi-view-pho',
    nameVi: '2 giường đôi view phố',
    nameEn: 'Two double beds city-view room',
    descriptionVi: 'Phòng 2 giường đôi view phố, phù hợp nhóm bạn hoặc gia đình cần chi phí gọn hơn.',
    descriptionEn: 'Two-double-bed city-view room, a practical option for families or groups looking for a clearer budget.',
    standardGuests: 4,
    maxGuests: 5,
    maxAdults: 5,
    maxChildren: 2,
    bedType: 'Two double beds',
    bedCount: 2,
    low: 900000,
    high: 1100000,
    peakWeekday: 1400000,
    peakWeekend: 1750000,
    inventoryQuantity: 8,
  },
  {
    slug: '1-giuong-king-view',
    nameVi: '1 giường King view núi',
    nameEn: 'King bed mountain-view room',
    descriptionVi: 'Phòng 1 giường King view núi cho cặp đôi hoặc khách đi công tác nghỉ dưỡng tại Cát Bà.',
    descriptionEn: 'King-bed mountain-view room for couples or business-leisure travellers staying in Cat Ba.',
    standardGuests: 2,
    maxGuests: 3,
    maxAdults: 3,
    maxChildren: 1,
    bedType: 'King',
    bedCount: 1,
    low: 650000,
    high: 800000,
    peakWeekday: 1100000,
    peakWeekend: 1400000,
    inventoryQuantity: 6,
  },
];

function catBaEcoPricingRules(room: RoomRate) {
  return [
    {
      name: 'Thấp điểm 2026',
      months: [1, 2, 3, 10, 11, 12],
      price: room.low,
      priority: 10,
    },
    {
      name: 'Cao điểm 1/4-15/5',
      startDate: '2026-04-01',
      endDate: '2026-05-15',
      price: room.high,
      priority: 20,
    },
    {
      name: 'Cao điểm 3/8-30/9',
      startDate: '2026-08-03',
      endDate: '2026-09-30',
      price: room.high,
      priority: 20,
    },
    {
      name: 'Đỉnh điểm Chủ nhật - Thứ 5',
      startDate: '2026-05-16',
      endDate: '2026-08-02',
      weekdays: [0, 1, 2, 3, 4],
      price: room.peakWeekday,
      priority: 30,
    },
    {
      name: 'Đỉnh điểm Thứ 6, Thứ 7',
      startDate: '2026-05-16',
      endDate: '2026-08-02',
      weekdays: [5, 6],
      price: room.peakWeekend,
      minNights: 2,
      priority: 40,
    },
    {
      name: 'Lễ 30/4-3/5 và 2/9',
      holidayDates: ['2026-04-30', '2026-05-01', '2026-05-02', '2026-05-03', '2026-09-02'],
      price: room.peakWeekend,
      minNights: 2,
      priority: 50,
    },
  ];
}

function roomImages(slug: string) {
  return [1, 2, 3, 4].map((index) => publicImage(`cat-ba-eco-hotel/${slug}-${index}.jpg`));
}

async function main() {
  const catBa = await prisma.location.upsert({
    where: { slug: 'cat-ba' },
    update: {
      name: 'Cát Bà',
      nameVi: 'Cát Bà',
      nameEn: 'Cat Ba',
      isActive: true,
    },
    create: {
      name: 'Cát Bà',
      nameVi: 'Cát Bà',
      nameEn: 'Cat Ba',
      slug: 'cat-ba',
      descriptionVi: 'Đảo nghỉ dưỡng miền Bắc với vịnh Lan Hạ, bãi tắm và nhiều lựa chọn khách sạn, tour biển.',
      descriptionEn: 'Northern island destination with Lan Ha Bay, beaches, hotels, cruises and coastal tours.',
      isActive: true,
    },
  });

  const data = {
    name: 'Cat Ba Eco Hotel',
    nameVi: 'Cat Ba Eco Hotel',
    nameEn: 'Cat Ba Eco Hotel',
    locationId: catBa.id,
    type: 'hotel',
    descriptionVi: 'Khách sạn tại Cát Bà với các hạng phòng gia đình, phòng 2 giường đôi và phòng King view núi. Giá đại lý 2026 thay đổi theo mùa, cuối tuần và ngày lễ.',
    descriptionEn: 'Cat Ba hotel with family duplex, two-double-bed rooms and king mountain-view rooms. 2026 agency rates vary by season, weekend and holidays.',
    basePrice: 650000,
    costPrice: 0,
    maxGuests: 40,
    images: JSON.stringify([...commonImages, ...roomImages('2-giuong-doi-view-nui').slice(0, 2)]),
    amenitiesVi: JSON.stringify([
      'meal::Bữa sáng buffet',
      'wifi::Wi-Fi',
      'restaurant::Nhà hàng',
      'sparkle::Dọn phòng hằng ngày',
      'water::Nước lọc và cà phê tiêu chuẩn phòng',
      'dryer::Máy sấy, ấm siêu tốc, tủ mát',
    ]),
    amenitiesEn: JSON.stringify([
      'meal::Buffet breakfast',
      'wifi::Wi-Fi',
      'restaurant::Restaurant',
      'sparkle::Daily housekeeping',
      'water::Daily water and coffee',
      'dryer::Hair dryer, kettle and mini fridge',
    ]),
    seoTitleVi: 'Cat Ba Eco Hotel - Giá phòng đại lý 2026 theo mùa',
    seoTitleEn: 'Cat Ba Eco Hotel - 2026 seasonal room rates',
    seoDescriptionVi: 'Đặt Cat Ba Eco Hotel với giá phòng theo thấp điểm, cao điểm, đỉnh điểm, cuối tuần và ngày lễ. Có hạng phòng gia đình, 2 giường đôi và King view núi.',
    seoDescriptionEn: 'Book Cat Ba Eco Hotel with low, high, peak, weekend and holiday rates. Family duplex, double-bed and king mountain-view rooms available.',
    seoKeywordsVi: 'Cat Ba Eco Hotel, khách sạn Cát Bà, giá phòng Cát Bà 2026',
    seoKeywordsEn: 'Cat Ba Eco Hotel, Cat Ba hotel, Cat Ba room rates 2026',
    isActive: true,
  };

  const existing = await prisma.property.findFirst({
    where: {
      name: data.name,
      locationId: catBa.id,
    },
  });

  const property = existing
    ? await prisma.property.update({
        where: { id: existing.id },
        data: {
          ...data,
          options: {
            deleteMany: {},
            create: rooms.map((room, index) => ({
              optionType: 'room',
              name: room.nameVi,
              nameVi: room.nameVi,
              nameEn: room.nameEn,
              description: room.descriptionVi,
              descriptionVi: room.descriptionVi,
              descriptionEn: room.descriptionEn,
              basePrice: room.low,
              costPrice: 0,
              maxGuests: room.maxGuests,
              maxAdults: room.maxAdults,
              maxChildren: room.maxChildren,
              includedGuests: room.standardGuests,
              extraGuestFee: 300000,
              inventoryQuantity: room.inventoryQuantity,
              bedType: room.bedType,
              bedCount: room.bedCount,
              images: JSON.stringify(roomImages(room.slug)),
              amenitiesVi: JSON.stringify(['meal::Bữa sáng buffet', 'wifi::Wi-Fi', 'sparkle::Dọn phòng hằng ngày']),
              amenitiesEn: JSON.stringify(['meal::Buffet breakfast', 'wifi::Wi-Fi', 'sparkle::Daily housekeeping']),
              pricingRules: JSON.stringify(catBaEcoPricingRules(room)),
              isActive: true,
              sortOrder: index,
            })),
          },
        },
      })
    : await prisma.property.create({
        data: {
          ...data,
          options: {
            create: rooms.map((room, index) => ({
              optionType: 'room',
              name: room.nameVi,
              nameVi: room.nameVi,
              nameEn: room.nameEn,
              description: room.descriptionVi,
              descriptionVi: room.descriptionVi,
              descriptionEn: room.descriptionEn,
              basePrice: room.low,
              costPrice: 0,
              maxGuests: room.maxGuests,
              maxAdults: room.maxAdults,
              maxChildren: room.maxChildren,
              includedGuests: room.standardGuests,
              extraGuestFee: 300000,
              inventoryQuantity: room.inventoryQuantity,
              bedType: room.bedType,
              bedCount: room.bedCount,
              images: JSON.stringify(roomImages(room.slug)),
              amenitiesVi: JSON.stringify(['meal::Bữa sáng buffet', 'wifi::Wi-Fi', 'sparkle::Dọn phòng hằng ngày']),
              amenitiesEn: JSON.stringify(['meal::Buffet breakfast', 'wifi::Wi-Fi', 'sparkle::Daily housekeeping']),
              pricingRules: JSON.stringify(catBaEcoPricingRules(room)),
              isActive: true,
              sortOrder: index,
            })),
          },
        },
      });

  console.log(`Imported Cat Ba Eco Hotel: ${property.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
