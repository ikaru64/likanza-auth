import { auth } from "../../../auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Autorise les appels depuis le site statique, qui est sur un autre nom de
// domaine. Une requête avec credentials ne peut pas utiliser Origin "*" (le
// navigateur la bloque) : il faut refléter l'origine si elle est autorisée.
const ALLOWED_ORIGINS = [
  "https://likanza-academy.vercel.app",
  "https://ikaru64.github.io",
  "http://localhost:5050",
  "http://127.0.0.1:5050",
];

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function GET(req) {
  const headers = corsHeaders(req.headers.get("origin"));
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Non connecté" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
  const rows = await sql`SELECT data FROM progress WHERE email = ${session.user.email}`;
  return new Response(JSON.stringify({ data: rows[0]?.data || null, email: session.user.email, name: session.user.name, image: session.user.image }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const headers = corsHeaders(req.headers.get("origin"));
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Non connecté" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
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
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
