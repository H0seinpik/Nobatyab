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

  const services = await request("/api/v1/services");
  assert(services.status === 200 && Array.isArray(services.body.data), "GET /api/v1/services");
  const serviceList = services.body.data as Array<{ id: string; defaultDuration: number }>;
  const bookable = serviceList.find((s) => s.defaultDuration % 30 === 0);
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

  const top = suggestions![0];
  const confirm = await request("/api/v1/confirm-booking", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      providerId: top.providerId,
      providerServiceId: top.providerServiceId,
      timeSlotIds: top.timeSlotIds,
    }),
  });
  assert(confirm.status === 201 && confirm.body.success, "POST /api/v1/confirm-booking");
  console.log("OK  POST /api/v1/confirm-booking");

  const reconfirm = await request("/api/v1/confirm-booking", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      providerId: top.providerId,
      providerServiceId: top.providerServiceId,
      timeSlotIds: top.timeSlotIds,
    }),
  });
  assert(reconfirm.status === 409, "POST /api/v1/confirm-booking conflict on same slots");
  console.log("OK  POST /api/v1/confirm-booking conflict (409)");

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
