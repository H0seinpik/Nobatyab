import dotenv from "dotenv";
import {
  PrismaClient,
  Role,
  AppointmentStatus,
  PaymentStatus,
  PaymentTransactionStatus,
  ServiceRequestStatus,
  ProviderRequestStatus,
  SmsStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { timeSlotSyncService } from "../src/modules/smart-booking/timeSlotSync.service.js";

dotenv.config();

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

const DEFAULT_PASSWORD = "Demo123!";

/** Tehran-area coordinates for map / distance demos */
const TEHRAN_LOCATIONS = [
  { lat: 35.6892, lng: 51.389, address: "تهران، میدان ونک" },
  { lat: 35.7219, lng: 51.3347, address: "تهران، سعادت‌آباد" },
  { lat: 35.7575, lng: 51.41, address: "تهران، تجریش" },
  { lat: 35.7005, lng: 51.4014, address: "تهران، ولیعصر" },
  { lat: 35.6683, lng: 51.3497, address: "تهران، شهرک غرب" },
  { lat: 35.732, lng: 51.472, address: "تهران، نارمک" },
  { lat: 35.655, lng: 51.43, address: "تهران، پونک" },
  { lat: 35.744, lng: 51.375, address: "تهران، پاسداران" },
  { lat: 35.71, lng: 51.45, address: "تهران، رسالت" },
  { lat: 35.68, lng: 51.48, address: "تهران، تهرانپارس" },
];

const WORKING_HOURS = [
  { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
  { dayOfWeek: 4, startTime: "10:00", endTime: "14:00" },
];

const REVIEW_COMMENTS = [
  "خدمات عالی و وقت‌شناسی فوق‌العاده",
  "برخورد بسیار محترمانه و حرفه‌ای",
  "محیط تمیز و آرام، پیشنهاد می‌کنم",
  "نتیجه کار رضایت‌بخش بود",
  "کمی معطلی داشتم ولی کیفیت خوب بود",
  "بهترین تجربه رزرو آنلاین که داشتم",
  "قیمت مناسب نسبت به کیفیت",
  "دفعه بعد هم حتماً مراجعه می‌کنم",
];

async function upsertProvider(input: {
  email: string;
  fullName: string;
  phone: string;
  specialization: string;
  bio: string;
  location: (typeof TEHRAN_LOCATIONS)[number];
  slotDurationMinutes?: number;
  serviceIds: string[];
  passwordHash: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      phone: input.phone,
      role: Role.PROVIDER,
      isActive: true,
    },
    create: {
      email: input.email,
      passwordHash: input.passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: Role.PROVIDER,
    },
  });

  const profile = await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: {
      specialization: input.specialization,
      bio: input.bio,
      address: input.location.address,
      latitude: input.location.lat,
      longitude: input.location.lng,
      slotDurationMinutes: input.slotDurationMinutes ?? 30,
      isAcceptingBookings: true,
    },
    create: {
      userId: user.id,
      specialization: input.specialization,
      bio: input.bio,
      address: input.location.address,
      latitude: input.location.lat,
      longitude: input.location.lng,
      slotDurationMinutes: input.slotDurationMinutes ?? 30,
      isAcceptingBookings: true,
      cancellationPolicy: {
        create: {
          minHoursBefore: 24,
          description: "لغو حداقل ۲۴ ساعت قبل از نوبت",
        },
      },
    },
  });

  const providerServices = [];
  for (const serviceId of input.serviceIds) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) continue;

    const ps = await prisma.providerService.upsert({
      where: { providerId_serviceId: { providerId: profile.id, serviceId } },
      update: {
        price: service.basePrice,
        duration: service.defaultDuration,
        isActive: true,
      },
      create: {
        providerId: profile.id,
        serviceId,
        price: service.basePrice,
        duration: service.defaultDuration,
      },
    });

    await prisma.workingHours.deleteMany({ where: { providerServiceId: ps.id } });
    await prisma.workingHours.createMany({
      data: WORKING_HOURS.map((wh) => ({ ...wh, providerServiceId: ps.id })),
    });

    providerServices.push(ps);
  }

  return { user, profile, providerServices };
}

async function recalculateProviderRatings(providerId: string) {
  const agg = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

async function main() {
  console.log("Seeding database with rich demo data...");

  const adminPassword = await hashPassword("Admin123!");
  const demoPassword = await hashPassword(DEFAULT_PASSWORD);

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

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "medical" },
      update: {},
      create: { name: "پزشکی", slug: "medical", description: "ویزیت، مشاوره و خدمات پزشکی" },
    }),
    prisma.category.upsert({
      where: { slug: "beauty" },
      update: {},
      create: { name: "زیبایی", slug: "beauty", description: "مراقبت پوست، مو و زیبایی" },
    }),
    prisma.category.upsert({
      where: { slug: "dental" },
      update: {},
      create: { name: "دندانپزشکی", slug: "dental", description: "خدمات دندانپزشکی و ارتودنسی" },
    }),
    prisma.category.upsert({
      where: { slug: "fitness" },
      update: {},
      create: { name: "ورزش و سلامت", slug: "fitness", description: "مربیگری، فیزیوتراپی و تناسب اندام" },
    }),
    prisma.category.upsert({
      where: { slug: "therapy" },
      update: {},
      create: { name: "روانشناسی", slug: "therapy", description: "مشاوره فردی و خانوادگی" },
    }),
    prisma.category.upsert({
      where: { slug: "nutrition" },
      update: {},
      create: { name: "تغذیه", slug: "nutrition", description: "برنامه غذایی و مشاوره تغذیه" },
    }),
  ]);

  const [medical, beauty, dental, fitness, therapy, nutrition] = categories;

  // ── Services ────────────────────────────────────────────────────────────────
  const serviceDefs = [
    { id: "seed-service-consultation", categoryId: medical.id, name: "مشاوره پزشکی", description: "ویزیت و مشاوره اولیه", duration: 30, price: 500000 },
    { id: "seed-service-skincare", categoryId: beauty.id, name: "مراقبت پوست", description: "فیشیال و مراقبت تخصصی پوست", duration: 60, price: 800000 },
    { id: "seed-service-laser", categoryId: beauty.id, name: "لیزر موهای زائد", description: "جلسه لیزر با دستگاه پیشرفته", duration: 30, price: 600000 },
    { id: "seed-svc-checkup", categoryId: medical.id, name: "چکاپ سلامت", description: "معاینه دوره‌ای کامل", duration: 45, price: 750000 },
    { id: "seed-svc-makeup", categoryId: beauty.id, name: "آرایش عروس", description: "آرایش حرفه‌ای مراسم", duration: 120, price: 2500000 },
    { id: "seed-svc-haircut", categoryId: beauty.id, name: "کوتاهی و استایل مو", description: "خدمات آرایشگاه", duration: 45, price: 350000 },
    { id: "seed-svc-dental-clean", categoryId: dental.id, name: "جرم‌گیری دندان", description: "پاکسازی و جرم‌گیری", duration: 30, price: 450000 },
    { id: "seed-svc-ortho", categoryId: dental.id, name: "مشاوره ارتودنسی", description: "بررسی و طرح درمان", duration: 45, price: 550000 },
    { id: "seed-svc-physio", categoryId: fitness.id, name: "فیزیوتراپی", description: "جلسه درمان و توانبخشی", duration: 45, price: 400000 },
    { id: "seed-svc-yoga", categoryId: fitness.id, name: "کلاس یوگا", description: "جلسه خصوصی یوگا", duration: 60, price: 300000 },
    { id: "seed-svc-therapy", categoryId: therapy.id, name: "مشاوره روانشناسی", description: "جلسه ۵۰ دقیقه‌ای فردی", duration: 50, price: 700000 },
    { id: "seed-svc-nutrition", categoryId: nutrition.id, name: "برنامه غذایی", description: "طراحی رژیم اختصاصی", duration: 40, price: 450000 },
  ];

  for (const s of serviceDefs) {
    const svc = await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        description: s.description,
        defaultDuration: s.duration,
        basePrice: s.price,
        isActive: true,
      },
      create: {
        id: s.id,
        categoryId: s.categoryId,
        name: s.name,
        description: s.description,
        defaultDuration: s.duration,
        basePrice: s.price,
      },
    });
  }

  // Deactivate duplicate services from a previous seed version
  await prisma.service.updateMany({
    where: { id: { in: ["seed-svc-consultation", "seed-svc-skincare", "seed-svc-laser"] } },
    data: { isActive: false },
  });

  // ── Regular users ───────────────────────────────────────────────────────────
  const userDefs = [
    { email: "user@nobatyab.com", fullName: "کاربر نمونه", phone: "09120000003", lat: 35.6892, lng: 51.389 },
    { email: "sara@demo.com", fullName: "سارا محمدی", phone: "09121111111", lat: 35.721, lng: 51.334 },
    { email: "ali@demo.com", fullName: "علی رضایی", phone: "09122222222", lat: 35.758, lng: 51.41 },
    { email: "maryam@demo.com", fullName: "مریم کریمی", phone: "09123333333", lat: 35.668, lng: 51.35 },
    { email: "reza@demo.com", fullName: "رضا حسینی", phone: "09124444444", lat: 35.732, lng: 51.472 },
    { email: "zahra@demo.com", fullName: "زهرا نوری", phone: "09125555555", lat: 35.655, lng: 51.43 },
    { email: "pending.provider@demo.com", fullName: "امیر درخواست‌دهنده", phone: "09126666666", lat: 35.7, lng: 51.4 },
  ];

  const users = [];
  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phone: u.phone,
        latitude: u.lat,
        longitude: u.lng,
        isActive: true,
      },
      create: {
        email: u.email,
        passwordHash: demoPassword,
        fullName: u.fullName,
        phone: u.phone,
        role: Role.USER,
        latitude: u.lat,
        longitude: u.lng,
      },
    });
    users.push(user);
  }

  const testUser = users[0];

  // User availability for smart booking
  await prisma.userAvailability.deleteMany({ where: { userId: testUser.id } });
  await prisma.userAvailability.createMany({
    data: [
      { userId: testUser.id, dayOfWeek: 0, startTime: "09:00", endTime: "12:00" },
      { userId: testUser.id, dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
      { userId: testUser.id, dayOfWeek: 2, startTime: "10:00", endTime: "13:00" },
      { userId: testUser.id, dayOfWeek: 3, startTime: "16:00", endTime: "20:00" },
      { userId: testUser.id, dayOfWeek: 5, startTime: "09:00", endTime: "11:00" },
    ],
  });

  // ── Providers ───────────────────────────────────────────────────────────────
  const providerDefs = [
    {
      email: "provider@nobatyab.com",
      fullName: "دکتر احمدی",
      phone: "09120000002",
      specialization: "متخصص پوست و مو",
      bio: "متخصص پوست و مو با ۱۰ سال سابقه در درمان آکنه و جوانسازی",
      location: TEHRAN_LOCATIONS[3],
      serviceIds: ["seed-service-consultation", "seed-service-skincare", "seed-service-laser"],
    },
    {
      email: "dr.karimi@demo.com",
      fullName: "دکتر کریمی",
      phone: "09130000001",
      specialization: "پزشک عمومی",
      bio: "ویزیت و چکاپ سلامت با بیش از ۱۵ سال تجربه",
      location: TEHRAN_LOCATIONS[0],
      serviceIds: ["seed-service-consultation", "seed-svc-checkup"],
    },
    {
      email: "dr.moradi@demo.com",
      fullName: "دکتر مرادی",
      phone: "09130000002",
      specialization: "دندانپزشک",
      bio: "جرم‌گیری، ایمپلنت و ارتودنسی با تجهیزات مدرن",
      location: TEHRAN_LOCATIONS[1],
      serviceIds: ["seed-svc-dental-clean", "seed-svc-ortho"],
    },
    {
      email: "beauty.salon@demo.com",
      fullName: "سالن زیبایی رز",
      phone: "09130000003",
      specialization: "آرایش و زیبایی",
      bio: "خدمات آرایش عروس، مراقبت پوست و کوتاهی مو",
      location: TEHRAN_LOCATIONS[4],
      serviceIds: ["seed-service-skincare", "seed-svc-makeup", "seed-svc-haircut"],
    },
    {
      email: "physio@demo.com",
      fullName: "کلینیک فیزیوتراپی نوین",
      phone: "09130000004",
      specialization: "فیزیوتراپیست",
      bio: "درمان دردهای عضلانی-اسکلتی و توانبخشی ورزشی",
      location: TEHRAN_LOCATIONS[5],
      serviceIds: ["seed-svc-physio", "seed-svc-yoga"],
    },
    {
      email: "therapy@demo.com",
      fullName: "دکتر صادقی",
      phone: "09130000005",
      specialization: "روانشناس بالینی",
      bio: "مشاوره فردی، زوج‌درمانی و مدیریت استرس",
      location: TEHRAN_LOCATIONS[7],
      serviceIds: ["seed-svc-therapy"],
    },
    {
      email: "nutrition@demo.com",
      fullName: "دکتر جعفری",
      phone: "09130000006",
      specialization: "متخصص تغذیه",
      bio: "طراحی رژیم لاغری، دیابت و ورزشکاران",
      location: TEHRAN_LOCATIONS[2],
      serviceIds: ["seed-svc-nutrition", "seed-svc-checkup"],
    },
    {
      email: "laser.center@demo.com",
      fullName: "مرکز لیزر پارسیان",
      phone: "09130000007",
      specialization: "لیزر و زیبایی",
      bio: "لیزر مو، جوانسازی و درمان لک با دستگاه‌های FDA",
      location: TEHRAN_LOCATIONS[6],
      serviceIds: ["seed-service-laser", "seed-service-skincare"],
    },
    {
      email: "yoga.studio@demo.com",
      fullName: "استودیو یوگا آرام",
      phone: "09130000008",
      specialization: "مربی یوگا",
      bio: "کلاس‌های خصوصی و گروهی یوگا و مدیتیشن",
      location: TEHRAN_LOCATIONS[8],
      serviceIds: ["seed-svc-yoga"],
    },
    {
      email: "hair.stylist@demo.com",
      fullName: "آرایشگر حرفه‌ای ناز",
      phone: "09130000009",
      specialization: "آرایشگر مو",
      bio: "رنگ، مش، کوتاهی و استایل حرفه‌ای",
      location: TEHRAN_LOCATIONS[9],
      serviceIds: ["seed-svc-haircut", "seed-svc-makeup"],
    },
  ];

  const providers = [];
  for (const p of providerDefs) {
    const passwordHash =
      p.email === "provider@nobatyab.com" ? await hashPassword("Provider123!") : demoPassword;
    providers.push(await upsertProvider({ ...p, passwordHash }));
  }

  // ── Appointments, payments & reviews (6 months of trends) ─────────────────
  const statuses: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  const paymentStatuses: PaymentStatus[] = ["PENDING", "PAID", "PAID", "FAILED"];

  let appointmentCounter = 0;
  let paymentCounter = 0;

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - monthOffset);
    baseDate.setDate(1);

    const appointmentsThisMonth = 8 + monthOffset * 2;

    for (let i = 0; i < appointmentsThisMonth; i++) {
      const providerIdx = i % providers.length;
      const { profile, providerServices } = providers[providerIdx];
      const ps = providerServices[i % providerServices.length];
      if (!ps) continue;

      const userIdx = i % users.length;
      const booker = users[userIdx];

      const day = 2 + ((i * 3) % 25);
      const startAt = new Date(baseDate);
      startAt.setDate(day);
      startAt.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);

      const endAt = new Date(startAt.getTime() + ps.duration * 60 * 1000);
      const statusIdx = i % statuses.length;
      const status = monthOffset === 0 && i < 3 ? "PENDING" : statuses[statusIdx];
      const paymentStatus =
        status === "COMPLETED" ? "PAID" : status === "CANCELLED" ? "PENDING" : paymentStatuses[statusIdx];

      appointmentCounter++;
      const apptId = `seed-appt-${appointmentCounter}`;

      const appointment = await prisma.appointment.upsert({
        where: { id: apptId },
        update: { status, paymentStatus, startAt, endAt },
        create: {
          id: apptId,
          providerId: profile.id,
          providerServiceId: ps.id,
          userId: booker.id,
          startAt,
          endAt,
          status,
          paymentStatus,
          notes: i % 4 === 0 ? "لطفاً ۱۰ دقیقه زودتر حاضر شوم" : undefined,
        },
      });

      if (status === "COMPLETED" && paymentStatus === "PAID") {
        paymentCounter++;
        await prisma.paymentTransaction.upsert({
          where: { id: `seed-pay-${paymentCounter}` },
          update: { amount: ps.price, status: PaymentTransactionStatus.SUCCESS },
          create: {
            id: `seed-pay-${paymentCounter}`,
            appointmentId: appointment.id,
            amount: ps.price,
            status: PaymentTransactionStatus.SUCCESS,
            providerKey: "simulated",
            createdAt: startAt,
          },
        });
      }

      if (status === "COMPLETED" && i % 2 === 0) {
        const rating = 3 + (i % 3);
        await prisma.review.upsert({
          where: { appointmentId: appointment.id },
          update: { rating, comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length] },
          create: {
            appointmentId: appointment.id,
            userId: booker.id,
            providerId: profile.id,
            rating,
            comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
            createdAt: endAt,
          },
        });
      }
    }
  }

  // Upcoming appointments for test user (my appointments page)
  const upcomingDates = [2, 5, 10].map((daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  for (let i = 0; i < upcomingDates.length; i++) {
    const { profile, providerServices } = providers[i];
    const ps = providerServices[0];
    const startAt = upcomingDates[i];
    const endAt = new Date(startAt.getTime() + ps.duration * 60 * 1000);

    await prisma.appointment.upsert({
      where: { id: `seed-upcoming-${i + 1}` },
      update: {},
      create: {
        id: `seed-upcoming-${i + 1}`,
        providerId: profile.id,
        providerServiceId: ps.id,
        userId: testUser.id,
        startAt,
        endAt,
        status: i === 0 ? "CONFIRMED" : "PENDING",
        paymentStatus: "PENDING",
      },
    });
  }

  // Completed without review (for review form demo)
  const reviewDemoProvider = providers[0];
  const reviewDemoPs = reviewDemoProvider.providerServices[0];
  const completedNoReview = await prisma.appointment.upsert({
    where: { id: "seed-appt-review-demo" },
    update: { status: "COMPLETED", paymentStatus: "PAID" },
    create: {
      id: "seed-appt-review-demo",
      providerId: reviewDemoProvider.profile.id,
      providerServiceId: reviewDemoPs.id,
      userId: testUser.id,
      startAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: "COMPLETED",
      paymentStatus: "PAID",
    },
  });

  await prisma.review.deleteMany({ where: { appointmentId: completedNoReview.id } });

  // Guest appointment
  const guestProvider = providers[1];
  await prisma.appointment.upsert({
    where: { id: "seed-appt-guest" },
    update: {},
    create: {
      id: "seed-appt-guest",
      providerId: guestProvider.profile.id,
      providerServiceId: guestProvider.providerServices[0].id,
      guestFullName: "مهمان نوبتی",
      guestPhone: "09127777777",
      guestEmail: "guest@demo.com",
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: "CONFIRMED",
      paymentStatus: "PENDING",
    },
  });

  // Recalculate all provider ratings
  for (const { profile } of providers) {
    await recalculateProviderRatings(profile.id);
  }

  // ── Time slots for booking / hero preview ───────────────────────────────────
  const featuredProviderIds = providers.slice(0, 3).map((p) => p.profile.id);
  await timeSlotSyncService.syncForProviders(featuredProviderIds, 14);

  // ── SMS notification history ────────────────────────────────────────────────
  const smsTemplates = [
    "نوبت شما با موفقیت ثبت شد.",
    "یادآوری: نوبت شما فردا ساعت {time} است.",
    "نوبت شما لغو شد.",
    "نوبت شما تأیید شد.",
  ];

  const recentAppointments = await prisma.appointment.findMany({
    take: 25,
    orderBy: { createdAt: "desc" },
    select: { id: true, userId: true, guestPhone: true, startAt: true },
  });

  let smsCounter = 0;
  for (const appt of recentAppointments) {
    smsCounter++;
    const phone =
      appt.guestPhone ??
      (appt.userId
        ? (await prisma.user.findUnique({ where: { id: appt.userId }, select: { phone: true } }))?.phone
        : null) ??
      "09120000000";
    const template = smsTemplates[smsCounter % smsTemplates.length];
    const timeLabel = `${String(appt.startAt.getHours()).padStart(2, "0")}:${String(appt.startAt.getMinutes()).padStart(2, "0")}`;
    await prisma.smsLog.upsert({
      where: { id: `seed-sms-${smsCounter}` },
      update: {},
      create: {
        id: `seed-sms-${smsCounter}`,
        appointmentId: appt.id,
        userId: appt.userId ?? undefined,
        phone,
        message: template.replace("{time}", timeLabel),
        status: smsCounter % 5 === 0 ? SmsStatus.FAILED : SmsStatus.SENT,
        providerKey: "kavenegar",
      },
    });
  }

  // ── Admin queue: pending requests ───────────────────────────────────────────
  const pendingProviderUser = users.find((u) => u.email === "pending.provider@demo.com")!;
  await prisma.providerRequest.upsert({
    where: { id: "seed-provider-request-1" },
    update: { status: ProviderRequestStatus.PENDING },
    create: {
      id: "seed-provider-request-1",
      userId: pendingProviderUser.id,
      status: ProviderRequestStatus.PENDING,
      note: "علاقه‌مند به ارائه خدمات مشاوره تغذیه هستم",
    },
  });

  await prisma.providerRequest.upsert({
    where: { id: "seed-provider-request-2" },
    update: {},
    create: {
      id: "seed-provider-request-2",
      userId: users[3].id,
      status: ProviderRequestStatus.PENDING,
      note: "درخواست فعالیت به عنوان مربی یوگا",
    },
  });

  const serviceRequestProvider = providers[4];
  await prisma.serviceRequest.upsert({
    where: { id: "seed-service-request-1" },
    update: { status: ServiceRequestStatus.PENDING },
    create: {
      id: "seed-service-request-1",
      providerId: serviceRequestProvider.profile.id,
      requestedById: serviceRequestProvider.user.id,
      proposedName: "ماساژ درمانی",
      proposedDescription: "جلسه ۶۰ دقیقه‌ای ماساژ ورزشی",
      proposedPrice: 550000,
      proposedDuration: 60,
      status: ServiceRequestStatus.PENDING,
    },
  });

  await prisma.serviceRequest.upsert({
    where: { id: "seed-service-request-2" },
    update: {},
    create: {
      id: "seed-service-request-2",
      providerId: providers[7].profile.id,
      requestedById: providers[7].user.id,
      proposedName: "جوانسازی با RF",
      proposedDescription: "درمان افتادگی پوست",
      proposedPrice: 1200000,
      proposedDuration: 45,
      status: ServiceRequestStatus.PENDING,
    },
  });

  // ── App settings ────────────────────────────────────────────────────────────
  const defaultSettings = [
    { key: "site.title", value: "نوبت‌یاب", group: "general", label: "عنوان سایت", type: "text" },
    {
      key: "site.description",
      value: "پلتفرم رزرو آنلاین نوبت — سریع، آسان و هوشمند",
      group: "general",
      label: "توضیحات سایت",
      type: "textarea",
    },
    { key: "site.email", value: "info@nobatyab.com", group: "contact", label: "ایمیل سایت", type: "email" },
    { key: "contact.email", value: "info@nobatyab.com", group: "contact", label: "ایمیل تماس", type: "email" },
    { key: "contact.phone", value: "021-12345678", group: "contact", label: "تلفن تماس", type: "tel" },
    { key: "contact.address", value: "تهران، خیابان ولیعصر، برج نوبت‌یاب", group: "contact", label: "آدرس", type: "textarea" },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  const stats = {
    users: await prisma.user.count({ where: { role: Role.USER } }),
    providers: await prisma.user.count({ where: { role: Role.PROVIDER } }),
    services: await prisma.service.count({ where: { isActive: true } }),
    appointments: await prisma.appointment.count(),
    reviews: await prisma.review.count(),
    payments: await prisma.paymentTransaction.count({ where: { status: "SUCCESS" } }),
    smsLogs: await prisma.smsLog.count(),
    timeSlots: await prisma.timeSlot.count(),
  };

  console.log("\nSeed completed successfully!\n");
  console.log("Accounts:");
  console.log("  Admin:    admin@nobatyab.com / Admin123!");
  console.log("  Provider: provider@nobatyab.com / Provider123!");
  console.log("  User:     user@nobatyab.com / User123!");
  console.log(`  Other users & providers: *@demo.com / ${DEFAULT_PASSWORD}`);
  console.log("\nDemo data:");
  console.log(`  ${stats.users} users, ${stats.providers} providers, ${stats.services} services`);
  console.log(`  ${stats.appointments} appointments, ${stats.reviews} reviews, ${stats.payments} payments`);
  console.log(`  ${stats.smsLogs} SMS logs, ${stats.timeSlots} time slots`);
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
