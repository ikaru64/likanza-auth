import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: true,
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        await sql`
          INSERT INTO users (email, name, image)
          VALUES (${user.email}, ${user.name}, ${user.image})
          ON CONFLICT (email) DO UPDATE SET name = ${user.name}, image = ${user.image}
        `;
      } catch (err) {
        console.error("Erreur lors de la création/mise à jour de l'utilisateur :", err);
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
});
