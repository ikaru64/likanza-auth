import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "../auth";

export default async function Home({ searchParams }) {
  const session = await auth();
  const sp = await searchParams;
  const callbackUrl = typeof sp?.callbackUrl === "string" && sp.callbackUrl ? sp.callbackUrl : "/";

  // Déjà connecté et on vient d'un autre site : on repart directement, pas
  // besoin d'afficher cette page intermédiaire.
  if (session && callbackUrl !== "/") {
    redirect(callbackUrl);
  }

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
              await signOut({ redirectTo: callbackUrl });
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
            await signIn("google", { redirectTo: callbackUrl });
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
