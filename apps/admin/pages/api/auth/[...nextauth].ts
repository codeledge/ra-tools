import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "next-auth-prisma-adapter";
import prismaClient from "db";
import CredentialsProvider from "next-auth/providers/credentials";

export default async function auth(req: any, res: any) {
  return await NextAuth(req, res, {
    //debug: true,
    secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
    adapter: PrismaAdapter(prismaClient, {
      userModel: "adminUser",
      accountModel: "adminAccount",
      sessionModel: "adminSession",
      verificationTokenModel: "adminVerificationToken",
    }),
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
          return Promise.resolve(true);
        }

        if (account.provider === "google" && profile.verified_email === true)
          return Promise.resolve(false);

        //restrict domain
        if (
          process.env.RESTRICT_EMAIL_DOMAIN &&
          !profile?.email?.endsWith(`@${process.env.RESTRICT_EMAIL_DOMAIN}`)
        ) {
          return Promise.resolve(false);
        }

        //ok
        return Promise.resolve(true);
      },
      session: async ({ session, user, token }) => {
        //always add this, very handy
        session.userId = user.id;

        // const admin = await prismaClient.adminUser.findUnique({
        //   select: {
        //     role: true,
        //   },
        //   where: { id: user.id },
        // });

        // session.role = admin?.role;

        return Promise.resolve(session);
      },
    },
  });
}
