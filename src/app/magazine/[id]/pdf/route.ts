import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("Lecture disponible uniquement dans l’application mobile.", {
    status: 410,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
