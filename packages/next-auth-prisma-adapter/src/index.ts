import { Adapter } from "next-auth/adapters";
import { PrismaClient, Prisma } from "@prisma/client";

// https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts
export function PrismaAdapter(
  p: PrismaClient,
  options?: {
    userModel?: string;
    accountModel?: string;
    sessionModel?: string;
    verificationTokenModel?: string;
  }
): Adapter {
  const userModel = p[options?.userModel ?? "user"];
  const accountModel = p[options?.accountModel ?? "account"];
  const sessionModel = p[options?.sessionModel ?? "session"];
  const verificationTokenModel =
    p[options?.verificationTokenModel ?? "verificationToken"];
  return {
    createUser: (data) => userModel.create({ data }),
    getUser: (id) => userModel.findUnique({ where: { id } }),
    getUserByEmail: (email) => userModel.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await accountModel.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: (data) => userModel.update({ where: { id: data.id }, data }),
    deleteUser: (id) => userModel.delete({ where: { id } }),
    linkAccount: (data) => accountModel.create({ data }) as any,
    unlinkAccount: (provider_providerAccountId) =>
      accountModel.delete({ where: { provider_providerAccountId } }) as any,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await sessionModel.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: (data) => sessionModel.create({ data }),
    updateSession: (data) =>
      sessionModel.update({ data, where: { sessionToken: data.sessionToken } }),
    deleteSession: (sessionToken) =>
      sessionModel.delete({ where: { sessionToken } }),
    createVerificationToken: (data) => verificationTokenModel.create({ data }),
    async useVerificationToken(identifier_token) {
      try {
        return await verificationTokenModel.delete({
          where: { identifier_token },
        });
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
  };
}
