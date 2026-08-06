import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Domaines du site statique autorisés à recevoir la redirection post-connexion.
const ALLOWED_REDIRECT_HOSTS = [
  "likanza-academy.vercel.app",
  "ikaru64.github.io",
  "localhost:5050",
  "127.0.0.1:5050",
];

// SameSite=None exige Secure, qui exige https : en dev local (http) on garde
// les valeurs par défaut de Next Auth, sinon aucun cookie ne serait posé.
const isProd = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // Le site statique appelle /api/progress en cross-origin avec credentials:"include" :
  // le cookie de session doit donc être envoyable cross-site (SameSite=None + Secure).
  ...(isProd
    ? {
        cookies: {
          sessionToken: { options: { sameSite: "none", secure: true } },
          callbackUrl: { options: { sameSite: "none", secure: true } },
          csrfToken: { options: { sameSite: "none", secure: true } },
        },
      }
    : {}),
  callbacks: {
    // Appelé à chaque connexion réussie : on crée ou met à jour la fiche utilisateur.
    async signIn({ user }) {
      try {
        await sql`
          INSERT INTO users (email, name, image)
          VALUES (${user.email}, ${user.name}, ${user.image})
          ON CONFLICT (email) DO UPDATE SET name = ${user.name}, image = ${user.image}
        `;
      } catch (err) {
        console.error("Erreur lors de la création/mise à jour de l'utilisateur :", err);
        // On laisse quand même la connexion réussir même si l'écriture échoue,
        // pour ne jamais bloquer quelqu'un qui essaie de se connecter.
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
    // Autorise à rediriger vers le site statique (autre domaine) après connexion/déconnexion.
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        if (ALLOWED_REDIRECT_HOSTS.includes(target.host)) return target.toString();
        if (target.origin === baseUrl) return target.toString();
      } catch {
        // url invalide : on retombe sur le comportement par défaut ci-dessous.
      }
      return baseUrl;
    },
  },
});
