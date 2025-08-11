"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignupState = {
  formError?: string;
  fieldErrors?: Partial<Record<"tenantName" | "tenantSlug" | "email" | "password", string>>;
};

export const initialSignupState: SignupState = {};

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Please enter a store name"),
  tenantSlug: z
    .string()
    .min(2, "Slug must be at least 2 chars")
    .max(32, "Slug must be <= 32 chars")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  email: z.preprocess((v) => String(v || "").trim().toLowerCase(), z.string().email("Enter a valid email")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((v) => /[a-z]/.test(v) && /[0-9]/.test(v), "Include letters and numbers"),
});

export async function signUpAndCreateTenantAction(prevState: SignupState, formData: FormData): Promise<SignupState | void> {
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

  try {
    const supabase = await createSupabaseServerClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error: signErr } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (signErr) {
      return { formError: signErr.message };
    }

    const { error: rpcErr } = await supabase.rpc("create_tenant_self", {
      p_name: values.tenantName,
      p_slug: values.tenantSlug,
    });
    if (rpcErr) {
      return { formError: rpcErr.message };
    }

    redirect(`/auth/login?next=/t/${values.tenantSlug}/admin/products`);
  } catch (e) {
    const err = e as { message?: string }; return { formError: err.message || "Something went wrong. Please try again." };
  }
} 