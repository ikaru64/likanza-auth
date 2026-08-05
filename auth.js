import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
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
  },
});
