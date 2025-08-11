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
  tenantName: z.string().min(2, "Please enter a store name"),
  tenantSlug: z
    .string()
    .min(2, "Slug must be at least 2 chars")
    .max(32, "Slug must be <= 32 chars")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  email: z.preprocess(
    (v) =>
      String(v || "")
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
        .replace(/\s+/g, "") // all whitespace
        .toLowerCase(),
    z.string().email("Enter a valid email")
  ),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .refine((v) => /[a-z]/.test(v) && /[0-9]/.test(v), "Include letters and numbers"),
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