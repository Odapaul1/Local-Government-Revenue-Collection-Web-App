import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  ip: string;
  userAgent: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  const ip =
    (opts.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    opts.req.socket?.remoteAddress ||
    "";
  const userAgent = opts.req.headers["user-agent"] || "";

  return {
    req: opts.req,
    res: opts.res,
    user,
    ip,
    userAgent,
  };
}
