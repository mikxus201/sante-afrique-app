// src/app/api/pay/init/route.ts
import { relay } from "../../_relay";
export async function POST(req: Request) { return relay(req, "/api/pay/init"); }
