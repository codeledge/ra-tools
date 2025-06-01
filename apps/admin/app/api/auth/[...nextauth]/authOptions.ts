import NextAuth, { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient } from "db";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "demo" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "demo",
        },
      },
      async authorize(credentials, req) {
        const user = {
          id: "userid1",
          name: "Demo name",
          email: "demo@example.com",
          role: "OWNER",
        };

        if (user) {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      //security
      if (user.email === "demo@example.com") {
        return true;
      }

      //restrict domain
      if (
        process.env.RESTRICT_EMAIL_DOMAIN &&
        !profile?.email?.endsWith(`@${process.env.RESTRICT_EMAIL_DOMAIN}`)
      ) {
        return false;
      }

      //ok
      return true;
    },
    jwt: async ({ token, user, trigger, account }) => {
      // console.log("jwt", { token, user, trigger, account });

      if (trigger === "signIn" && account?.provider === "google") {
        if (!user.email) {
          throw new Error("No email returned from google");
        }
        // No need for prisma adapter with custom query and jwt strategy
        const adminUser = await prismaClient.adminUser.upsert({
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            image: true,
          },
          where: { email: user.email },
          update: {
            // TODO: last login at
          },
          create: {
            name: user.name,
            email: user.email,
            image: user.image,
            role: "OWNER",
          },
        });

        // even if you don't return token fields, they will be added to the jwt token
        // such as iat, exp, jti etc

        return <Session["user"]>{
          image: adminUser.image,
          name: adminUser.name,
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        };
      }

      return token;
    },
    session: async ({ session, token }) => {
      // console.log("session", { session, user, token, newSession, trigger });

      const { image, name, userId, email, role } = token as Session["user"]; // cast to Session["user"] next auth doesn't know...

      session.user = { image, name, userId, email, role }; // add to session only the good fields, the rest is token, not needed

      return session;
    },
  },
};
