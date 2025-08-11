"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const params = useSearchParams();
  const baseNext = params.get("next") || "/onboarding";
  const prefillSlug = params.get("prefillSlug");
  const prefillName = params.get("prefillName");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.get("error"));
  const [loading, setLoading] = useState(false);

  function buildNextUrl() {
    if (!prefillSlug && !prefillName) return baseNext;
    const url = new URL(baseNext, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (prefillSlug) url.searchParams.set("prefillSlug", prefillSlug);
    if (prefillName) url.searchParams.set("prefillName", prefillName);
    return url.pathname + (url.search ? url.search : "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace(buildNextUrl());
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text:white/80">Email</label>
            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="form-input w-full h-12 rounded-lg bg-white/10 text-white p-4 border-none placeholder:text-white/50"
              placeholder="you@acme.com"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-white/80">Password</label>
            <input
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              type="password"
              className="form-input w-full h-12 rounded-lg bg:white/10 text-white p-4 border-none placeholder:text-white/50"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={PASSWORD_MIN_LENGTH}
            />
          </div>
          <button
            disabled={loading}
            className="w-full h-12 rounded-lg bg-[#1e3c6c] hover:bg-[#244a84] transition font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
} 