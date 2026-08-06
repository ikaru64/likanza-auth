import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "../auth";

// Domaines du site statique autorisés comme destination de redirection.
const ALLOWED_REDIRECT_HOSTS = [
  "likanza-academy.vercel.app",
  "ikaru64.github.io",
  "localhost:5050",
  "127.0.0.1:5050",
];

function isAllowedCallback(url) {
  try {
    return ALLOWED_REDIRECT_HOSTS.includes(new URL(url).host);
  } catch {
    return false;
  }
}

function withParam(url, param) {
  return url + (url.includes("?") ? "&" : "?") + param;
}

export default async function Home({ searchParams }) {
  const session = await auth();
  const sp = await searchParams;
  const rawCallback = typeof sp?.callbackUrl === "string" ? sp.callbackUrl : "";
  const hasExternalCallback = rawCallback && isAllowedCallback(rawCallback);
  const callbackUrl = hasExternalCallback ? rawCallback : "/";
  const wantsSignOut = sp?.action === "signout";

  if (hasExternalCallback) {
    if (wantsSignOut) {
      // Déjà déconnecté : on repart directement avec le marqueur, rien à confirmer.
      if (!session) redirect(withParam(callbackUrl, "la_signedout=1"));
      // Sinon on affiche ci-dessous le bouton de confirmation de déconnexion.
    } else if (session) {
      // Connecté et on vient d'un autre site pour se connecter : on repart avec
      // les infos utilisateur encodées dans le fragment (jamais envoyé au serveur).
      const payload = Buffer.from(
        JSON.stringify({ email: session.user.email, name: session.user.name, image: session.user.image })
      ).toString("base64");
      redirect(`${callbackUrl}#la_user=${encodeURIComponent(payload)}`);
    }
  }

  const signInRedirect = hasExternalCallback ? `/?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/";
  const signOutRedirect = hasExternalCallback ? withParam(callbackUrl, "la_signedout=1") : "/";

  return (
    <div
      style={{
        background: "#0B0B0D",
        color: "#EDE8DE",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>Likanza Academy — Compte</h1>
      <p style={{ color: "#9B968C", fontSize: 13, maxWidth: 420 }}>
        Connexion Likanza Academy.
      </p>

      {session ? (
        <>
          <p>
            Connecté en tant que <strong>{session.user.email}</strong>
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: signOutRedirect });
            }}
          >
            <button
              type="submit"
              style={{
                background: "none",
                border: "1px solid rgba(184,151,78,0.4)",
                color: "#EDE8DE",
                padding: "10px 20px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Se déconnecter
            </button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: signInRedirect });
          }}
        >
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #B8974E, #D9BC7C)",
              border: "none",
              color: "#0B0B0D",
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Se connecter avec Google
          </button>
        </form>
      )}
    </div>
  );
}
