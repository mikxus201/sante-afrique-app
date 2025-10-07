// src/app/mot-de-passe-oublie/page.tsx
import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié ? | Santé Afrique",
  description: "Réinitialisez votre mot de passe pour accéder à votre compte Santé Afrique.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mx-auto max-w-lg rounded border bg-white p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-center">Mot de passe oublié ?</h1>
        <p className="mt-2 text-center text-neutral-700">
          Saisissez votre adresse e-mail et nous vous enverrons des instructions pour réinitialiser votre mot de passe.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
