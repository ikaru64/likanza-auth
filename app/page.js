import { auth, signIn, signOut } from "../auth";

export default async function Home() {
  const session = await auth();

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
        Page de test de la connexion. Une fois que ça fonctionne ici, on la reliera au site principal.
      </p>

      {session ? (
        <>
          <p>
            Connecté en tant que <strong>{session.user.email}</strong>
          </p>
          <form
            action={async () => {
              "use server";
              await signOut();
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
            await signIn("google");
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
