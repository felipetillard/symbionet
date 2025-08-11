"use client";

import { useCallback, useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAndCreateTenantAction } from "./actions/signup";

type SignupState = {
  formError?: string;
  fieldErrors?: Partial<Record<"tenantName" | "tenantSlug" | "email" | "password", string>>;
};

const initialState: SignupState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 rounded-lg bg-[#1e3c6c] hover:bg-[#244a84] transition font-bold disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create store"}
    </button>
  );
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function SignupForm() {
  const [state, formAction] = useActionState<SignupState, FormData>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signUpAndCreateTenantAction as any,
    initialState
  );
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");

  const onSlugChange = useCallback((v: string) => {
    const cleaned = v
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 32)
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    setSlug(cleaned);
  }, []);

  const onEmailChange = useCallback((v: string) => {
    const normalized = v
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
      .replace(/\s+/g, "")
      .toLowerCase();
    setEmail(normalized);
  }, []);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthText = ["Too weak", "Weak", "Okay", "Good", "Strong"][strength] || "";
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"][strength] || "bg-transparent";

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state?.formError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3">
          {state.formError}
        </div>
      )}
      <div>
        <label className="block text-sm mb-1 text-white/80">Store name</label>
        <input
          name="tenantName"
          value={tenantName}
          onChange={(e)=>setTenantName(e.target.value)}
          placeholder="Acme Boutique"
          className="form-input w-full rounded-lg bg-white/10 text-white h-12 p-4 border-none placeholder:text-white/50"
          required
          aria-invalid={Boolean(state?.fieldErrors?.tenantName)}
          aria-describedby={state?.fieldErrors?.tenantName ? "err-name" : undefined}
        />
        {state?.fieldErrors?.tenantName && (
          <p id="err-name" className="text-xs text-red-300 mt-1">{state.fieldErrors.tenantName}</p>
        )}
      </div>
      <div>
        <label className="block text-sm mb-1 text-white/80">Slug</label>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-lg bg-white/10 text-white/70 text-sm">/t/</span>
          <input
            name="tenantSlug"
            placeholder="acme"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="form-input flex-1 rounded-lg bg-white/10 text-white h-12 p-4 border-none placeholder:text-white/50"
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            required
            aria-invalid={Boolean(state?.fieldErrors?.tenantSlug)}
            aria-describedby={state?.fieldErrors?.tenantSlug ? "err-slug" : undefined}
          />
        </div>
        {state?.fieldErrors?.tenantSlug && (
          <p id="err-slug" className="text-xs text-red-300 mt-1">{state.fieldErrors.tenantSlug}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-white/80">Email</label>
          <input
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e)=>onEmailChange(e.target.value)}
            placeholder="you@acme.com"
            className="form-input w-full rounded-lg bg-white/10 text-white h-12 p-4 border-none placeholder:text-white/50"
            required
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            aria-describedby={state?.fieldErrors?.email ? "err-email" : undefined}
            autoComplete="email"
          />
          {state?.fieldErrors?.email && (
            <p id="err-email" className="text-xs text-red-300 mt-1">{state.fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1 text-white/80">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="form-input w-full rounded-lg bg-white/10 text-white h-12 p-4 border-none placeholder:text-white/50"
            minLength={8}
            required
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={state?.fieldErrors?.password ? "err-pass" : undefined}
            autoComplete="new-password"
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-full bg-white/10 rounded">
              <div className={`h-1.5 rounded ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
            </div>
            <span className="text-xs text-white/70 w-16">{strengthText}</span>
          </div>
          {state?.fieldErrors?.password && (
            <p id="err-pass" className="text-xs text-red-300 mt-1">{state.fieldErrors.password}</p>
          )}
        </div>
      </div>
      <SubmitButton />
      <p className="text-xs text-white/60">By continuing you agree to our Terms and Privacy Policy.</p>
    </form>
  );
} 