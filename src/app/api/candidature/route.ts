// @ts-nocheck
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";         // on utilise le FS
export const dynamic = "force-dynamic";   // évite certains caches en dev

function sanitize(name) {
  return String(name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const email = (form.get("email") || "").toString();
    const phone = (form.get("phone") || "").toString();
    const message = (form.get("message") || "").toString();
    const jobId = (form.get("jobId") || "unknown").toString();
    const jobTitle = (form.get("jobTitle") || "").toString();

    const cv = form.get("cv");
    const lm = form.get("lm");

    if (!email || !phone || !cv || !lm) {
      return NextResponse.json({ ok: false, error: "Champs requis manquants." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), ".uploads", "candidatures", jobId);
    await mkdir(uploadDir, { recursive: true });

    async function save(prefix, file) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const original = sanitize(file.name || "fichier");
      const filename = `${prefix}-${Date.now()}-${original}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, bytes);
      return { filename, size: bytes.length };
    }

    const saved = {
      cv: await save("cv", cv),
      lm: await save("lm", lm),
    };

    return NextResponse.json({
      ok: true,
      received: { email, phone, message, jobId, jobTitle },
      saved,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
