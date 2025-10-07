// src/app/api/auth/verify-otp/route.ts
import { relay } from "../../_relay";
export async function POST(req: Request) { return relay(req, "/api/auth/otp/verify"); }
