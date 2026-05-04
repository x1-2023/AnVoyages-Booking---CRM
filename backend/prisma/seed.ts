import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@anvoyages.vn' },
    update: {},
    create: {
      email: 'admin@anvoyages.vn',
      name: 'An Voyages Admin',
      password: hashedPassword,
      role: 'super_admin',
    },
  });

  console.log('Admin user created:', admin.email);

  const catBaData = {
    name: 'Cát Bà',
    slug: 'cat-ba',
    description: 'Đảo ngọc với vịnh Lan Hạ, bãi tắm đẹp và nhiều hành trình nghỉ dưỡng biển.',
    seoTitle: 'Du lịch Cát Bà - Phòng nghỉ, tour và du thuyền',
    seoDescription: 'Đặt khách sạn, homestay, tour biển và du thuyền tại Cát Bà cùng An Voyages.',
    isActive: true,
  };

  const catBa = await prisma.location.upsert({
    where: { slug: catBaData.slug },
    update: catBaData,
    create: catBaData,
  });

  const haLongData = {
    name: 'Hạ Long',
    slug: 'ha-long',
    description: 'Vịnh di sản nổi tiếng với du thuyền nghỉ đêm, tour tham quan và khách sạn ven biển.',
    seoTitle: 'Du lịch Hạ Long - Du thuyền, phòng nghỉ và tour',
    seoDescription: 'Lịch trình du thuyền Hạ Long, khách sạn và combo nghỉ dưỡng được chọn lọc bởi An Voyages.',
    isActive: true,
  };

  const haLong = await prisma.location.upsert({
    where: { slug: haLongData.slug },
    update: haLongData,
    create: haLongData,
  });

  const coToData = {
    name: 'Cô Tô',
    slug: 'co-to',
    description: 'Điểm đến biển đảo hoang sơ, phù hợp nghỉ dưỡng ngắn ngày và tour trải nghiệm.',
    seoTitle: 'Du lịch Cô Tô - Combo phòng và tour biển đảo',
    seoDescription: 'Khám phá Cô Tô với combo khách sạn, tàu cao tốc và tour trải nghiệm bản địa.',
    isActive: true,
  };

  const coTo = await prisma.location.upsert({
    where: { slug: coToData.slug },
    update: coToData,
    create: coToData,
  });

  const quanLanData = {
    name: 'Quan Lạn',
    slug: 'quan-lan',
    description: 'Bãi biển dài, yên tĩnh và phù hợp cho kỳ nghỉ gia đình hoặc nhóm riêng tư.',
    seoTitle: 'Du lịch Quan Lạn - Nghỉ dưỡng biển phía Bắc',
    seoDescription: 'Đặt phòng nghỉ và tour khám phá Quan Lạn với lịch trình tối ưu từ An Voyages.',
    isActive: true,
  };

  const quanLan = await prisma.location.upsert({
    where: { slug: quanLanData.slug },
    update: quanLanData,
    create: quanLanData,
  });

  console.log('Locations ready:', catBa.name, haLong.name, coTo.name, quanLan.name);

  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();

  const properties = [
    {
      name: 'Flamingo Cát Bà Beach Resort',
      locationId: catBa.id,
      type: 'hotel',
      description: 'Resort biển phù hợp khách gia đình và khách nghỉ dưỡng cuối tuần tại Cát Bà.',
      basePrice: 3200000,
      maxGuests: 2,
      amenities: JSON.stringify(['WiFi', 'Bể bơi', 'Nhà hàng', 'Spa']),
      isActive: true,
    },
    {
      name: 'Tour Vịnh Lan Hạ 1 ngày',
      locationId: catBa.id,
      type: 'tour',
      description: 'Tour cano và tàu thăm vịnh Lan Hạ, chèo kayak và ăn trưa trên vịnh.',
      basePrice: 950000,
      maxGuests: 10,
      amenities: JSON.stringify(['Hướng dẫn viên', 'Ăn trưa', 'Kayak']),
      isActive: true,
    },
    {
      name: 'Du thuyền Paradise Elegance',
      locationId: haLong.id,
      type: 'cruise',
      description: 'Du thuyền nghỉ đêm cao cấp trên vịnh Hạ Long cho khách cặp đôi và gia đình nhỏ.',
      basePrice: 5000000,
      maxGuests: 2,
      amenities: JSON.stringify(['WiFi', 'Nhà hàng', 'Bar', 'Kayaking', 'Spa']),
      isActive: true,
    },
    {
      name: 'Combo khách sạn trung tâm Hạ Long',
      locationId: haLong.id,
      type: 'hotel',
      description: 'Khách sạn trung tâm thuận tiện đi cảng, chợ đêm và các điểm vui chơi tại Hạ Long.',
      basePrice: 1800000,
      maxGuests: 2,
      amenities: JSON.stringify(['WiFi', 'Ăn sáng', 'Xe đưa đón']),
      isActive: true,
    },
    {
      name: 'Khách sạn Cô Tô Sunrise',
      locationId: coTo.id,
      type: 'hotel',
      description: 'Khách sạn gần biển, phù hợp khách lẻ và nhóm đi nghỉ hè tại Cô Tô.',
      basePrice: 1400000,
      maxGuests: 3,
      amenities: JSON.stringify(['WiFi', 'Xe điện', 'Ăn sáng']),
      isActive: true,
    },
    {
      name: 'Tour trải nghiệm biển Cô Tô',
      locationId: coTo.id,
      type: 'tour',
      description: 'Lịch trình tham quan bãi đá, bãi biển và trải nghiệm hải sản địa phương.',
      basePrice: 750000,
      maxGuests: 12,
      amenities: JSON.stringify(['Hướng dẫn viên', 'Ăn trưa']),
      isActive: true,
    },
    {
      name: 'Quan Lạn Eco Stay',
      locationId: quanLan.id,
      type: 'homestay',
      description: 'Homestay phong cách bản địa cho khách thích không gian riêng và gần bãi biển.',
      basePrice: 1200000,
      maxGuests: 4,
      amenities: JSON.stringify(['WiFi', 'Xe đạp', 'BBQ']),
      isActive: true,
    },
    {
      name: 'Tour biển Quan Lạn 2 ngày 1 đêm',
      locationId: quanLan.id,
      type: 'tour',
      description: 'Gói tour ngắn ngày phù hợp nhóm bạn và gia đình muốn đi cuối tuần.',
      basePrice: 1650000,
      maxGuests: 8,
      amenities: JSON.stringify(['Xe điện', 'Ăn 3 bữa', 'Hướng dẫn viên']),
      isActive: true,
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log('Sample properties created:', properties.length);

  const booking = await prisma.booking.create({
    data: {
      customerName: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'customer@example.com',
      locationId: haLong.id,
      checkIn: new Date('2026-05-10T00:00:00.000Z'),
      checkOut: new Date('2026-05-12T00:00:00.000Z'),
      guests: 2,
      totalPrice: 5000000,
      status: 'pending',
      note: 'Khách cần tư vấn thêm combo xe và ăn tối.',
    },
  });

  console.log('Sample booking created:', booking.id);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
