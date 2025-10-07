import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DATA_FILE = path.join(process.cwd(), "data", "issues.json");

// Récupération des données
export async function GET() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return NextResponse.json(JSON.parse(txt));
  } catch (err) {
    console.error("Erreur lecture issues.json:", err);
    // Si pas de fichier JSON, on retourne un tableau vide
    return NextResponse.json([]);
  }
}

// Sauvegarde des données
export async function POST(req: Request) {
  const body = await req.json();

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), "utf8");

  return NextResponse.json({ ok: true });
}
