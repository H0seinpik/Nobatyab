/**
 * Concurrent booking test — run with backend up: npm run test:concurrent-booking
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

async function loginUser(email: string, password: string) {
  const res = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 200 || !res.body.data?.accessToken) {
    throw new Error(`Login failed for ${email}`);
  }
  return res.body.data.accessToken as string;
}

async function main() {
  console.log(`Concurrent booking test against ${BASE}...\n`);

  const user1Token = await loginUser("user@nobatyab.com", "User123!");
  const user1Headers = { Authorization: `Bearer ${user1Token}` };

  const user2Register = await request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: `concurrent-${Date.now()}@nobatyab.com`,
      password: "User123!",
      fullName: "Concurrent User",
      phone: "09120000088",
    }),
  });
  if (user2Register.status !== 201 || !user2Register.body.data?.accessToken) {
    throw new Error("Failed to register second user");
  }
  const user2Token = user2Register.body.data.accessToken as string;
  const user2Headers = { Authorization: `Bearer ${user2Token}` };

  const services = await request("/api/v1/services");
  const serviceList = services.body.data as Array<{ id: string; defaultDuration: number }>;
  const bookable = serviceList.find((s) => s.defaultDuration % 30 === 0);
  if (!bookable) throw new Error("No bookable service found");

  const suggest = await request("/api/v1/smart-booking/suggest", {
    method: "POST",
    headers: user1Headers,
    body: JSON.stringify({
      serviceId: bookable.id,
      preference: "time",
      horizonDays: 14,
    }),
  });
  const suggestions = suggest.body.data?.suggestions as
    | Array<{ providerId: string; providerServiceId: string; timeSlotIds: string[] }>
    | undefined;
  if (!suggestions?.length) throw new Error("No suggestions returned");

  const target = suggestions.find((s, i) => i > 0) ?? suggestions[0];
  const payload = {
    providerId: target.providerId,
    providerServiceId: target.providerServiceId,
    timeSlotIds: target.timeSlotIds,
  };

  const [res1, res2] = await Promise.all([
    request("/api/v1/confirm-booking", {
      method: "POST",
      headers: user1Headers,
      body: JSON.stringify(payload),
    }),
    request("/api/v1/confirm-booking", {
      method: "POST",
      headers: user2Headers,
      body: JSON.stringify(payload),
    }),
  ]);

  const statuses = [res1.status, res2.status].sort();
  if (JSON.stringify(statuses) !== JSON.stringify([201, 409])) {
    console.error("FAIL expected [201, 409], got", statuses);
    process.exit(1);
  }

  console.log("OK  parallel confirm-booking: exactly one 201 and one 409");
  console.log("\nConcurrent booking test passed.");
}

main().catch((err) => {
  console.error("Concurrent booking test failed:", err.message ?? err);
  process.exit(1);
});
