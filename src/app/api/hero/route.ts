import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "hero.json");

export async function GET() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    return NextResponse.json(
      { error: "Impossible de lire hero.json" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // Validation minimaliste
    if (!body || !Array.isArray(body.slides) || body.slides.length < 1) {
      return NextResponse.json(
        { error: "Format invalide. slides[] requis." },
        { status: 400 }
      );
    }
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Échec d'écriture hero.json" },
      { status: 500 }
    );
  }
}
