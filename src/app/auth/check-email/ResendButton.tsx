"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResendButton({ email }: { email: string }) {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onResend() {
    setLoading(true);
    setMessage(null);
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage("Email resent. Please check your inbox and spam folder.");
  }

  return (
    <div className="space-y-2">
      <button
        onClick={onResend}
        disabled={loading}
        className="w-full h-10 rounded-lg bg-gray-100 text-[#101319] font-medium hover:bg-gray-200 disabled:opacity-60"
        type="button"
      >
        {loading ? "Resending..." : "Resend email"}
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
} 