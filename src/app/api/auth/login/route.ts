// src/app/api/auth/login/route.ts
import { relay } from "../../_relay";
export async function POST(req: Request) { return relay(req, "/api/auth/login"); }
