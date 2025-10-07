// src/app/api/cinetpay/notify/route.ts
import { NextResponse } from "next/server";

/**
 * CinetPay POST ici après tentative de paiement.
 * Selon votre contrat, vous pouvez vérifier une signature / reconsulter l’API
 * de vérification pour confirmer le statut.
 * Pour l’instant on log + 200 OK (à brancher sur votre BD ensuite).
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  console.log("[CINETPAY][NOTIFY] -->", JSON.stringify(payload));

  // TODO: Vérifier la signature si fournie (via SECRET_KEY) et
  // mettre à jour la commande/abonnement en BD (status = success/failed).

  // Toujours répondre 200 pour indiquer réception
  return NextResponse.json({ ok: true });
}
