import NextAuth from "next-auth";
import { authOptions } from "../../../../auth/auth";

const nextAuth = NextAuth(authOptions);

export { nextAuth as GET, nextAuth as POST };
