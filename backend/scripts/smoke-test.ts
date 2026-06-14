/**
 * API smoke test — run after `npm run setup:db` and `npm run dev`
 * Usage: npm run smoke
 */
const BASE = process.env.API_URL ?? "http://localhost:3000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log(`Smoke testing ${BASE}...\n`);

  const health = await request("/health");
  assert(health.status === 200, "GET /health");
  console.log("OK  GET /health");

  const categories = await request("/api/v1/categories");
  assert(categories.status === 200 && categories.body.success, "GET /api/v1/categories");
  console.log("OK  GET /api/v1/categories");

  const login = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "user@nobatyab.com", password: "User123!" }),
  });
  assert(login.status === 200 && login.body.data?.accessToken, "POST /api/v1/auth/login");
  console.log("OK  POST /api/v1/auth/login");

  const token = login.body.data.accessToken as string;
  const authHeaders = { Authorization: `Bearer ${token}` };

  const me = await request("/api/v1/auth/me", { headers: authHeaders });
  assert(me.status === 200 && me.body.data?.email, "GET /api/v1/auth/me");
  console.log("OK  GET /api/v1/auth/me");

  const userNationalCode = "0499370899";
  const patchProfile = await request("/api/v1/user/profile", {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      firstName: "کاربر",
      lastName: "تست",
      phone: "09120000003",
      nationalCode: userNationalCode,
      age: 30,
      address: "تهران، خیابان تست",
    }),
  });
  assert(patchProfile.status === 200 && patchProfile.body.success, "PATCH /api/v1/user/profile");
  console.log("OK  PATCH /api/v1/user/profile");

  const getProfile = await request("/api/v1/user/profile", { headers: authHeaders });
  assert(
    getProfile.status === 200 &&
      getProfile.body.data?.firstName === "کاربر" &&
      getProfile.body.data?.lastName === "تست" &&
      getProfile.body.data?.nationalCode === userNationalCode &&
      getProfile.body.data?.age === 30 &&
      getProfile.body.data?.address === "تهران، خیابان تست",
    "GET /api/v1/user/profile persists fields",
  );
  console.log("OK  GET /api/v1/user/profile persists fields");

  const dupNationalUser = await request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: `dup-nc-smoke-${Date.now()}@nobatyab.com`,
      password: "User123!",
      fullName: "Dup National",
      phone: "09120000097",
    }),
  });
  assert(dupNationalUser.status === 201 && dupNationalUser.body.data?.accessToken, "POST register dup national user");
  const dupNationalHeaders = { Authorization: `Bearer ${dupNationalUser.body.data.accessToken}` };
  const dupNationalPatch = await request("/api/v1/user/profile", {
    method: "PATCH",
    headers: dupNationalHeaders,
    body: JSON.stringify({ nationalCode: userNationalCode }),
  });
  assert(dupNationalPatch.status === 409, "PATCH /api/v1/user/profile duplicate nationalCode (409)");
  console.log("OK  PATCH /api/v1/user/profile duplicate nationalCode (409)");

  const providerLogin = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "provider@nobatyab.com", password: "Provider123!" }),
  });
  assert(providerLogin.status === 200 && providerLogin.body.data?.accessToken, "POST provider login");
  const providerHeaders = { Authorization: `Bearer ${providerLogin.body.data.accessToken}` };

  const patchProviderProfile = await request("/api/v1/provider/profile", {
    method: "PATCH",
    headers: providerHeaders,
    body: JSON.stringify({
      specialization: "پزشک عمومی",
      bio: "بیوگرافی تست",
      address: "اصفهان، خیابان ارائه‌دهنده",
      latitude: 32.6546,
      longitude: 51.668,
    }),
  });
  assert(patchProviderProfile.status === 200 && patchProviderProfile.body.success, "PATCH /api/v1/provider/profile");
  console.log("OK  PATCH /api/v1/provider/profile");

  const getProviderProfile = await request("/api/v1/provider/profile", { headers: providerHeaders });
  assert(
    getProviderProfile.status === 200 &&
      getProviderProfile.body.data?.specialization === "پزشک عمومی" &&
      getProviderProfile.body.data?.bio === "بیوگرافی تست" &&
      getProviderProfile.body.data?.address === "اصفهان، خیابان ارائه‌دهنده",
    "GET /api/v1/provider/profile persists fields",
  );
  console.log("OK  GET /api/v1/provider/profile persists fields");

  const workingHours = await request("/api/v1/provider/working-hours", { headers: providerHeaders });
  assert(workingHours.status === 200 && workingHours.body.data?.length > 0, "GET /api/v1/provider/working-hours");
  const hourId = workingHours.body.data[0].id as string;
  assert(workingHours.body.data[0].isActive !== false, "seed working hour starts active");

  const deactivateHour = await request(`/api/v1/provider/${hourId}/status`, {
    method: "PATCH",
    headers: providerHeaders,
    body: JSON.stringify({ isActive: false }),
  });
  assert(deactivateHour.status === 200 && deactivateHour.body.success, "PATCH /api/v1/provider/:id/status deactivate");
  const deactivatedRow = deactivateHour.body.data.find((h: { id: string }) => h.id === hourId);
  assert(deactivatedRow?.isActive === false, "PATCH /api/v1/provider/:id/status returns inactive row");

  const refetchHours = await request("/api/v1/provider/working-hours", { headers: providerHeaders });
  const refetchedRow = refetchHours.body.data.find((h: { id: string }) => h.id === hourId);
  assert(refetchedRow?.isActive === false, "GET /api/v1/provider/working-hours persists inactive status");
  console.log("OK  PATCH /api/v1/provider/:id/status toggle + refetch");

  const reactivateHour = await request(`/api/v1/provider/${hourId}/status`, {
    method: "PATCH",
    headers: providerHeaders,
    body: JSON.stringify({ isActive: true }),
  });
  assert(reactivateHour.status === 200, "PATCH /api/v1/provider/:id/status reactivate");
  const reactivatedRow = reactivateHour.body.data.find((h: { id: string }) => h.id === hourId);
  assert(reactivatedRow?.isActive === true, "PATCH /api/v1/provider/:id/status restores active");
  console.log("OK  PATCH /api/v1/provider/:id/status restore");

  const addHour = await request("/api/v1/provider/working-hours", {
    method: "POST",
    headers: providerHeaders,
    body: JSON.stringify({ dayOfWeek: 2, startTime: "14:00", endTime: "18:00", isActive: true }),
  });
  assert(addHour.status === 201 && addHour.body.success, "POST /api/v1/provider/working-hours");
  const addedHour = addHour.body.data.find(
    (h: { dayOfWeek: number; startTime: string }) => h.dayOfWeek === 2 && h.startTime === "14:00",
  );
  assert(addedHour?.id, "POST /api/v1/provider/working-hours returns new row");
  console.log("OK  POST /api/v1/provider/working-hours");

  const providerServicesBefore = await request("/api/v1/provider/services", { headers: providerHeaders });
  assert(providerServicesBefore.status === 200 && providerServicesBefore.body.success, "GET /api/v1/provider/services");
  const beforeCount = providerServicesBefore.body.data.length;
  console.log("OK  GET /api/v1/provider/services");

  const addService = await request("/api/v1/provider/services", {
    method: "POST",
    headers: providerHeaders,
    body: JSON.stringify({
      name: `Smoke Provider Service ${Date.now()}`,
      duration: 30,
      price: 150000,
      description: "smoke test service",
    }),
  });
  assert(addService.status === 201 && addService.body.success, "POST /api/v1/provider/services");
  const createdServiceId = addService.body.data.id as string;
  const createdCatalogServiceId = addService.body.data.serviceId as string;
  console.log("OK  POST /api/v1/provider/services");

  const providerServicesAfter = await request("/api/v1/provider/services", { headers: providerHeaders });
  assert(
    providerServicesAfter.body.data.length === beforeCount + 1,
    "GET /api/v1/provider/services lists new service",
  );
  console.log("OK  GET /api/v1/provider/services after create");

  const providers = await request("/api/v1/providers");
  assert(providers.status === 200 && providers.body.success, "GET /api/v1/providers");
  console.log("OK  GET /api/v1/providers");

  const availability = await request("/api/v1/user/availability", { headers: authHeaders });
  assert(availability.status === 200 && availability.body.success, "GET /api/v1/user/availability");
  console.log("OK  GET /api/v1/user/availability");

  if (!availability.body.data?.length) {
    const putAvailability = await request("/api/v1/user/availability", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        entries: [
          { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 0, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
        ],
      }),
    });
    assert(putAvailability.status === 200 && putAvailability.body.success, "PUT /api/v1/user/availability");
    console.log("OK  PUT /api/v1/user/availability");
  }

  const suggestNewService = await request("/api/v1/smart-booking/suggest", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      serviceId: createdCatalogServiceId,
      preference: "time",
      horizonDays: 14,
    }),
  });
  assert(
    suggestNewService.status === 200 && suggestNewService.body.success,
    "POST /api/v1/smart-booking/suggest for new provider service",
  );
  const newSuggestions = suggestNewService.body.data?.suggestions as unknown[] | undefined;
  assert(
    Array.isArray(newSuggestions) && newSuggestions.length > 0,
    "timeSlotSync produces bookable slots after provider service + hours",
  );
  console.log("OK  POST /api/v1/smart-booking/suggest for new provider service");

  const deleteService = await request(`/api/v1/provider/services/${createdServiceId}`, {
    method: "DELETE",
    headers: providerHeaders,
  });
  assert(deleteService.status === 200 && deleteService.body.success, "DELETE /api/v1/provider/services");
  console.log("OK  DELETE /api/v1/provider/services");

  if (addedHour?.id) {
    const deleteHour = await request(`/api/v1/provider/working-hours/${addedHour.id}`, {
      method: "DELETE",
      headers: providerHeaders,
    });
    assert(deleteHour.status === 200 && deleteHour.body.success, "DELETE /api/v1/provider/working-hours/:id");
    console.log("OK  DELETE /api/v1/provider/working-hours/:id");
  }

  const services = await request("/api/v1/services");
  assert(services.status === 200 && Array.isArray(services.body.data), "GET /api/v1/services");
  const serviceList = services.body.data as Array<{ id: string; defaultDuration: number }>;
  const bookable =
    serviceList.find((s) => s.id === "seed-service-consultation") ??
    serviceList.find((s) => s.defaultDuration % 30 === 0);
  assert(bookable, "service with 30-min compatible duration");
  const serviceId = bookable!.id;

  const suggest = await request("/api/v1/smart-booking/suggest", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      serviceId,
      preference: "time",
      horizonDays: 14,
    }),
  });
  assert(suggest.status === 200 && suggest.body.success, "POST /api/v1/smart-booking/suggest");
  const suggestions = suggest.body.data?.suggestions as
    | Array<{
        providerId: string;
        providerServiceId: string;
        timeSlotIds: string[];
      }>
    | undefined;
  assert(Array.isArray(suggestions) && suggestions.length > 0, "suggest returns suggestions");
  console.log("OK  POST /api/v1/smart-booking/suggest");

  let top = suggestions![0];
  let confirmPayload = {
    providerId: top.providerId,
    providerServiceId: top.providerServiceId,
    timeSlotIds: top.timeSlotIds,
  };

  let confirm = await request("/api/v1/confirm-booking", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(confirmPayload),
  });
  assert(
    (confirm.status === 201 || confirm.status === 200) && confirm.body.success,
    "POST /api/v1/confirm-booking",
  );
  console.log(`OK  POST /api/v1/confirm-booking (${confirm.status})`);

  if (confirm.body.data?.status === "CANCELLED") {
    for (let i = 1; i < suggestions!.length; i++) {
      top = suggestions![i];
      confirmPayload = {
        providerId: top.providerId,
        providerServiceId: top.providerServiceId,
        timeSlotIds: top.timeSlotIds,
      };
      confirm = await request("/api/v1/confirm-booking", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(confirmPayload),
      });
      if (
        confirm.status === 201 &&
        confirm.body.success &&
        confirm.body.data?.status !== "CANCELLED"
      ) {
        console.log("OK  POST /api/v1/confirm-booking fresh slot after cancelled replay");
        break;
      }
    }
  }

  assert(
    confirm.body.data?.status !== "CANCELLED",
    "confirm-booking has an active appointment for conflict/cancel tests",
  );

  const reconfirm = await request("/api/v1/confirm-booking", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(confirmPayload),
  });
  assert(
    reconfirm.status === 200 && reconfirm.body.success,
    "POST /api/v1/confirm-booking idempotent replay (200)",
  );
  console.log("OK  POST /api/v1/confirm-booking idempotent replay (200)");

  const user2Register = await request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: `user2-smoke-${Date.now()}@nobatyab.com`,
      password: "User123!",
      fullName: "Smoke User Two",
      phone: "09120000099",
    }),
  });
  assert(user2Register.status === 201 && user2Register.body.data?.accessToken, "POST register user2");
  const user2Token = user2Register.body.data.accessToken as string;
  const user2Headers = { Authorization: `Bearer ${user2Token}` };

  const otherUserConflict = await request("/api/v1/confirm-booking", {
    method: "POST",
    headers: user2Headers,
    body: JSON.stringify(confirmPayload),
  });
  assert(otherUserConflict.status === 409, "POST /api/v1/confirm-booking conflict for other user (409)");
  console.log("OK  POST /api/v1/confirm-booking conflict for other user (409)");

  const concurrentTarget = suggestions!.length > 1 ? suggestions![1] : null;
  if (concurrentTarget) {
    const concurrentPayload = {
      providerId: concurrentTarget.providerId,
      providerServiceId: concurrentTarget.providerServiceId,
      timeSlotIds: concurrentTarget.timeSlotIds,
    };

    const user3Register = await request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: `user3-smoke-${Date.now()}@nobatyab.com`,
        password: "User123!",
        fullName: "Smoke User Three",
        phone: "09120000098",
      }),
    });
    assert(user3Register.status === 201 && user3Register.body.data?.accessToken, "POST register user3");
    const user3Token = user3Register.body.data.accessToken as string;
    const user3Headers = { Authorization: `Bearer ${user3Token}` };

    const concurrent = await Promise.all([
      request("/api/v1/confirm-booking", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(concurrentPayload),
      }),
      request("/api/v1/confirm-booking", {
        method: "POST",
        headers: user3Headers,
        body: JSON.stringify(concurrentPayload),
      }),
    ]);
    const concurrentStatuses = concurrent.map((r) => r.status).sort();
    assert(
      JSON.stringify(concurrentStatuses) === JSON.stringify([201, 409]),
      "concurrent confirm-booking: one 201 and one 409",
    );
    console.log("OK  concurrent POST /api/v1/confirm-booking (201 + 409)");
  } else {
    console.log("SKIP concurrent POST /api/v1/confirm-booking (single suggestion only)");
  }

  const appointmentId = confirm.body.data?.id as string;
  assert(appointmentId, "confirm-booking returns appointment id");

  const adminLoginCancel = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@nobatyab.com", password: "Admin123!" }),
  });
  assert(adminLoginCancel.status === 200 && adminLoginCancel.body.data?.accessToken, "POST admin login for cancel");
  const adminCancelHeaders = { Authorization: `Bearer ${adminLoginCancel.body.data.accessToken}` };

  const adminCancel = await request(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    headers: adminCancelHeaders,
    body: JSON.stringify({ reason: "smoke test admin cancel" }),
  });
  assert(
    adminCancel.status === 200 &&
      adminCancel.body.success &&
      adminCancel.body.data?.status === "CANCELLED",
    "PATCH /api/v1/appointments/:id/cancel by admin",
  );
  console.log("OK  PATCH /api/v1/appointments/:id/cancel by admin");

  const cancelAgain = await request(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    headers: adminCancelHeaders,
    body: JSON.stringify({ reason: "duplicate cancel" }),
  });
  assert(cancelAgain.status === 400, "PATCH cancel already-cancelled appointment (400)");
  console.log("OK  PATCH cancel already-cancelled (400)");

  const myAppointments = await request("/api/v1/appointments/my", { headers: authHeaders });
  assert(myAppointments.status === 200 && myAppointments.body.success, "GET /api/v1/appointments/my");
  const myList = myAppointments.body.data as Array<{ id: string; status: string }>;
  const cancelledApt = myList.find((a) => a.id === appointmentId);
  assert(cancelledApt?.status === "CANCELLED", "user sees CANCELLED appointment");
  console.log("OK  GET /api/v1/appointments/my shows CANCELLED");

  const providerReq = await request("/api/v1/provider/request", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ note: "smoke test provider application" }),
  });
  if (providerReq.status === 201) {
    console.log("OK  POST /api/v1/provider/request");
    const duplicateReq = await request("/api/v1/provider/request", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ note: "duplicate" }),
    });
    assert(duplicateReq.status === 409, "POST /api/v1/provider/request duplicate blocked");
    console.log("OK  POST /api/v1/provider/request duplicate (409)");
  } else {
    assert(providerReq.status === 409, "POST /api/v1/provider/request");
    console.log("OK  POST /api/v1/provider/request already pending (409)");
  }

  const adminLogin = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@nobatyab.com", password: "Admin123!" }),
  });
  assert(adminLogin.status === 200 && adminLogin.body.data?.accessToken, "POST admin login");
  const adminHeaders = { Authorization: `Bearer ${adminLogin.body.data.accessToken}` };
  const adminProviderReqs = await request("/api/v1/admin/provider-requests", {
    headers: adminHeaders,
  });
  assert(
    adminProviderReqs.status === 200 &&
      adminProviderReqs.body.success &&
      Array.isArray(adminProviderReqs.body.data),
    "GET /api/v1/admin/provider-requests",
  );
  console.log("OK  GET /api/v1/admin/provider-requests");

  console.log("\nAll smoke tests passed.");
}

function assert(condition: boolean, label: string) {
  if (!condition) {
    console.error(`FAIL ${label}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message ?? err);
  console.error("\nEnsure PostgreSQL is running, migrations applied, seed done, and server is up.");
  process.exit(1);
});
