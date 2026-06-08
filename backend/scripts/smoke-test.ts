/**
 * API smoke test — run after `npm run setup:db` and `npm run dev`
 * Usage: npm run smoke
 */
const BASE = process.env.API_URL ?? "http://localhost:3000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
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

  const me = await request("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(me.status === 200 && me.body.data?.email, "GET /api/v1/auth/me");
  console.log("OK  GET /api/v1/auth/me");

  const providers = await request("/api/v1/providers");
  assert(providers.status === 200 && providers.body.success, "GET /api/v1/providers");
  console.log("OK  GET /api/v1/providers");

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
