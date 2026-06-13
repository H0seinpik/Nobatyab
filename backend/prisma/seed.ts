import dotenv from "dotenv";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

dotenv.config();

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("Admin123!");
  const providerPassword = await hashPassword("Provider123!");
  const userPassword = await hashPassword("User123!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@nobatyab.com" },
    update: {},
    create: {
      email: "admin@nobatyab.com",
      passwordHash: adminPassword,
      fullName: "مدیر سیستم",
      phone: "09120000001",
      role: Role.ADMIN,
    },
  });

  const providerUser = await prisma.user.upsert({
    where: { email: "provider@nobatyab.com" },
    update: {},
    create: {
      email: "provider@nobatyab.com",
      passwordHash: providerPassword,
      fullName: "دکتر احمدی",
      phone: "09120000002",
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          bio: "متخصص پوست و مو با ۱۰ سال سابقه",
          slotDurationMinutes: 30,
          isAcceptingBookings: true,
          latitude: 35.7,
          longitude: 51.42,
          cancellationPolicy: {
            create: { minHoursBefore: 24, description: "لغو حداقل ۲۴ ساعت قبل از نوبت" },
          },
        },
      },
    },
    include: { providerProfile: true },
  });

  await prisma.providerProfile.update({
    where: { userId: providerUser.id },
    data: { latitude: 35.7, longitude: 51.42 },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "user@nobatyab.com" },
    update: {
      latitude: 35.6892,
      longitude: 51.389,
    },
    create: {
      email: "user@nobatyab.com",
      passwordHash: userPassword,
      fullName: "کاربر نمونه",
      phone: "09120000003",
      role: Role.USER,
      latitude: 35.6892,
      longitude: 51.389,
    },
  });

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId: providerUser.id },
  });

  if (!providerProfile) throw new Error("Provider profile not found");

  const workingHours = [
    { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
    { dayOfWeek: 0, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
  ];

  await prisma.workingHours.deleteMany({ where: { providerId: providerProfile.id } });
  await prisma.workingHours.createMany({
    data: workingHours.map((wh) => ({ ...wh, providerId: providerProfile.id })),
  });

  const medical = await prisma.category.upsert({
    where: { slug: "medical" },
    update: {},
    create: { name: "پزشکی", slug: "medical", description: "خدمات پزشکی" },
  });

  const beauty = await prisma.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: { name: "زیبایی", slug: "beauty", description: "خدمات زیبایی" },
  });

  const consultation = await prisma.service.upsert({
    where: { id: "seed-service-consultation" },
    update: {},
    create: {
      id: "seed-service-consultation",
      categoryId: medical.id,
      name: "مشاوره پزشکی",
      description: "ویزیت و مشاوره اولیه",
      defaultDuration: 30,
      basePrice: 500000,
    },
  });

  const skinCare = await prisma.service.upsert({
    where: { id: "seed-service-skincare" },
    update: { defaultDuration: 60 },
    create: {
      id: "seed-service-skincare",
      categoryId: beauty.id,
      name: "مراقبت پوست",
      description: "فیشیال و مراقبت پوست",
      defaultDuration: 60,
      basePrice: 800000,
    },
  });

  const laser = await prisma.service.upsert({
    where: { id: "seed-service-laser" },
    update: {},
    create: {
      id: "seed-service-laser",
      categoryId: beauty.id,
      name: "لیزر موهای زائد",
      description: "جلسه لیزر",
      defaultDuration: 30,
      basePrice: 600000,
    },
  });

  for (const svc of [consultation, skinCare, laser]) {
    await prisma.providerService.upsert({
      where: {
        providerId_serviceId: { providerId: providerProfile.id, serviceId: svc.id },
      },
      update: {
        duration: svc.defaultDuration,
        price: svc.basePrice,
      },
      create: {
        providerId: providerProfile.id,
        serviceId: svc.id,
        price: svc.basePrice,
        duration: svc.defaultDuration,
      },
    });
  }

  const defaultSettings = [
    { key: "site.title", value: "نوبت‌یاب", group: "general", label: "عنوان سایت", type: "text" },
    { key: "site.description", value: "پلتفرم رزرو آنلاین نوبت", group: "general", label: "توضیحات سایت", type: "textarea" },
    { key: "contact.email", value: "info@nobatyab.com", group: "contact", label: "ایمیل تماس", type: "email" },
    { key: "contact.phone", value: "021-12345678", group: "contact", label: "تلفن تماس", type: "tel" },
    { key: "contact.address", value: "تهران، ایران", group: "contact", label: "آدرس", type: "textarea" },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Seed completed:");
  console.log(`  Admin:    admin@nobatyab.com / Admin123!`);
  console.log(`  Provider: provider@nobatyab.com / Provider123!`);
  console.log(`  User:     user@nobatyab.com / User123!`);
  console.log(`  Admin ID: ${admin.id}`);
}

main()
  .catch((e) => {
    if (String(e).includes("Can't reach database server")) {
      console.error("\nPostgreSQL is not reachable. Start your database first:");
      console.error("  - Install PostgreSQL and create database 'nobatyab'");
      console.error("  - Or run: docker compose up -d postgres");
      console.error("  - Then: npm run setup:db\n");
    }
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
