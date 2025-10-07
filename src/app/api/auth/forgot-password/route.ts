// @ts-nocheck
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = (form.get("email") || "").toString().trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: "Adresse e-mail manquante." }, { status: 400 });
    }

    // TODO: rechercher l’utilisateur, générer un token, envoyer un e-mail
    // Ici on simule simplement le succès.
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}
