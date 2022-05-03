import NextAuth, { Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prismaAdminClient } from "../../../prisma/prismaAdminClient";

export default async function auth(req: any, res: any) {
  return await NextAuth(req, res, {
    //debug: true,
    adapter: PrismaAdapter(prismaAdminClient),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    // callbacks: {
    //   signIn: async (user, account, profile) => {
    //     //security
    //     if (account.provider === "google" && profile.verified_email === true)
    //       return Promise.resolve(false);

    //     //restrict domain
    //     if (
    //       process.env.RESTRICT_EMAIL_DOMAIN &&
    //       !profile?.email?.endsWith(`@${process.env.RESTRICT_EMAIL_DOMAIN}`)
    //     ) {
    //       return Promise.resolve(false);
    //     }

    //     //ok
    //     return Promise.resolve(true);
    //   },
    //   session: async (session: Session, user: User) => {
    //     //always add this, very handy
    //     session.userId = user.id;

    //     const userDoc = await prisma..findById(user.id, "role").lean();

    //     session.role = userDoc?.role;

    //     return Promise.resolve(session);
    //   },
    // },
  });
}
