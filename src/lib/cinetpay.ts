// src/lib/cinetpay.ts
type CreatePaymentParams = {
  transaction_id: string;
  amount: number;
  currency?: string;
  description: string;
  notify_url: string;
  return_url: string;
  customer_name?: string;
  customer_surname?: string;
  customer_email?: string;
  customer_phone_number?: string;
  customer_address?: string;
  customer_city?: string;
  customer_country?: string; // ex "CI"
  channels?: "ALL" | "MOBILE_MONEY" | "CREDIT_CARD" | "WALLET";
  lang?: "FR" | "EN";
  lock_phone_number?: boolean;
  metadata?: Record<string, any>;
  invoice_data?: Record<string, any>;
};

export type CinetPayInitResponse = {
  code: string; // "201" = CREATED
  message?: string;
  description?: string;
  data?: {
    payment_url?: string;
    payment_token?: string;
  };
};

const CINETPAY_ENDPOINT = "https://api-checkout.cinetpay.com/v2/payment";

export async function cinetpayCreatePayment(params: CreatePaymentParams) {
  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: params.transaction_id,
    amount: params.amount,
    currency: params.currency || process.env.CINETPAY_CURRENCY || "XOF",
    description: params.description,
    notify_url: params.notify_url,
    return_url: params.return_url,
    channels: params.channels || "ALL",
    lang: params.lang || "FR",
    customer_name: params.customer_name,
    customer_surname: params.customer_surname,
    customer_email: params.customer_email,
    customer_phone_number: params.customer_phone_number,
    customer_address: params.customer_address,
    customer_city: params.customer_city,
    customer_country: params.customer_country || "CI",
    lock_phone_number: params.lock_phone_number ?? false,
    metadata: params.metadata || {},
    invoice_data: params.invoice_data || {},
  };

  const res = await fetch(CINETPAY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as CinetPayInitResponse | null;
  if (!json) throw new Error("Réponse CinetPay invalide");
  return json;
}
