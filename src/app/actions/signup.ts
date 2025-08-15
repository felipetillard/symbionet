"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

type SignupState = {
  formError?: string;
  fieldErrors?: Partial<Record<"tenantName" | "tenantSlug" | "email" | "password", string>>;
};

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Por favor ingresa un nombre de tienda"),
  tenantSlug: z
    .string()
    .min(2, "El identificador debe tener al menos 2 caracteres")
    .max(32, "El identificador debe tener máximo 32 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa letras minúsculas, números y guiones"),
  email: z.preprocess(
    (v) =>
      String(v || "")
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
        .replace(/\s+/g, "") // all whitespace
        .toLowerCase(),
    z.string().email("Ingresa un correo electrónico válido")
  ),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .refine((v) => /[a-z]/.test(v) && /[0-9]/.test(v), "Incluye letras y números"),
});

export async function signUpAndCreateTenantAction(
  _state: SignupState,
  formData: FormData
): Promise<SignupState | void> {
  const parsed = onboardingSchema.safeParse({
    tenantName: formData.get("tenantName"),
    tenantSlug: formData.get("tenantSlug"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<SignupState["fieldErrors"]>;
      fieldErrors![k] = issue.message;
    }
    return { fieldErrors };
  }

  const values = parsed.data;

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const nextLogin = `/auth/login?next=/onboarding&prefillSlug=${values.tenantSlug}&prefillName=${values.tenantName}`;

  const { error: signErr } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextLogin)}` },
  });
  if (signErr) {
    return { formError: signErr.message };
  }

  redirect(
    `/auth/check-email?email=${encodeURIComponent(values.email)}&next=${encodeURIComponent(nextLogin)}`
  );
} 