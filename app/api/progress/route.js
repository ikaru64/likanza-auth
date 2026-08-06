import { auth } from "../../../auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Autorise les appels depuis le site statique (GitHub Pages), qui est sur un
// autre nom de domaine. À restreindre à ton vrai domaine une fois connu.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Non connecté" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const rows = await sql`SELECT data FROM progress WHERE email = ${session.user.email}`;
  return new Response(JSON.stringify({ data: rows[0]?.data || null, email: session.user.email }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Non connecté" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const body = await req.json();
  await sql`
    INSERT INTO progress (email, data, updated_at)
    VALUES (${session.user.email}, ${JSON.stringify(body)}, now())
    ON CONFLICT (email) DO UPDATE SET data = ${JSON.stringify(body)}, updated_at = now()
  `;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
