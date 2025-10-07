// src/app/magazine/[id]/pdf/route.ts
import path from "path";
import { promises as fs } from "fs";
import { issues } from "@/data/issues";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const key = params.id;

  // Autoriser "n-020" ou "20"
  const issue =
    issues.find((i) => String(i.id) === key) ??
    issues.find((i) => String(i.number) === key);

  if (!issue) return new Response("Not found", { status: 404 });

  // Chemin du PDF (privilégie l’extrait si présent)
  const rel = (issue.excerptPdf ?? `/magazine/${issue.id}.pdf`).replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", rel);

  try {
    // Lecture du PDF - Buffer Node
    const buf = await fs.readFile(filePath);

    // Conversion sûre pour Response: Uint8Array (BodyInit = BufferSource OK)
    const bytes = new Uint8Array(buf);

    const safeName = `${issue.id}.pdf`.replace(/[^\w.-]+/g, "_");

    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        // inline = lecture dans le navigateur, sans téléchargement
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("PDF not found", { status: 404 });
  }
}
