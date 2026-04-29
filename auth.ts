import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        (token as Record<string, unknown>).accessToken = account.access_token;
        (token as Record<string, unknown>).refreshToken = account.refresh_token;
        (token as Record<string, unknown>).expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as { accessToken?: string }).accessToken =
        ((token as Record<string, unknown>).accessToken as
          | string
          | undefined) ?? undefined;
      return session;
    },
  },
});
