const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function optionTypeFor(propertyType) {
  if (propertyType === 'hotel' || propertyType === 'homestay') return 'room';
  if (propertyType === 'cruise') return 'cabin';
  if (propertyType === 'transport' || propertyType === 'car-rental') return 'vehicle';
  return 'package';
}

async function main() {
  const properties = await prisma.property.findMany({
    include: { options: true },
  });

  let created = 0;
  for (const property of properties) {
    if (property.options.length > 0) continue;

    const optionType = optionTypeFor(property.type);
    const defaultNameVi = optionType === 'room'
      ? 'Hạng tiêu chuẩn'
      : optionType === 'cabin'
        ? 'Cabin tiêu chuẩn'
        : optionType === 'vehicle'
          ? 'Gói tiêu chuẩn'
          : 'Gói tiêu chuẩn';
    const defaultNameEn = optionType === 'room'
      ? 'Standard room'
      : optionType === 'cabin'
        ? 'Standard cabin'
        : optionType === 'vehicle'
          ? 'Standard option'
          : 'Standard package';

    await prisma.productOption.create({
      data: {
        propertyId: property.id,
        optionType,
        name: defaultNameVi,
        nameVi: defaultNameVi,
        nameEn: defaultNameEn,
        descriptionVi: property.descriptionVi || property.description,
        descriptionEn: property.descriptionEn,
        basePrice: property.basePrice,
        adultPrice: property.adultPrice,
        childPrice: property.childPrice,
        costPrice: property.costPrice,
        maxGuests: property.maxGuests,
        images: property.images,
        amenities: property.amenities,
        amenitiesVi: property.amenitiesVi,
        amenitiesEn: property.amenitiesEn,
        isActive: property.isActive,
        sortOrder: 0,
      },
    });
    created += 1;
  }

  console.log(`Created ${created} default product options.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
