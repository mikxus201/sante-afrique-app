// src/app/api/account/avatar/route.ts
// @ts-nocheck
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitize(name: string) {
  return String(name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("avatar") as unknown as Blob;
    const userId = (form.get("userId") || "anonymous").toString();

    if (!file) {
      return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars", userId);
    await mkdir(uploadDir, { recursive: true });

    const name = sanitize((file as any).name || "avatar.png");
    const filename = `${Date.now()}-${name}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(filepath, bytes);

    const publicUrl = `/uploads/avatars/${userId}/${filename}`;
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}
