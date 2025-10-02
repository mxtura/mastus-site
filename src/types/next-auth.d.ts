import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      login: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    login: string;
    email?: string | null;
    name?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    login?: string;
    email?: string;
  }
}
