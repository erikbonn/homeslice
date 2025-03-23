import { handlers } from "@/server/auth";
import GoogleProvider from "next-auth/providers/google";

export const { GET, POST } = handlers;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};
