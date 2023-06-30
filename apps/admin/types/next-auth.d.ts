import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getServerSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      email: string;
      image?: string;
      name: string;
      role?: Role;
      userId: string;
    };
  }
}
