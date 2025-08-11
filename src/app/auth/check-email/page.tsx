import ResendButton from "./ResendButton";

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string }> }) {
  const params = await searchParams;
  const email = params.email || "your inbox";
  const next = params.next || "/auth/login";
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl border p-6 space-y-4 text-center">
        <h1 className="text-xl font-bold">Confirm your email</h1>
        <p className="text-[#586d8d]">We sent a confirmation link to <span className="font-medium text-[#101319]">{email}</span>.</p>
        <p className="text-[#586d8d]">After confirming, click below to continue to login.</p>
        <a className="inline-flex h-12 items-center justify-center rounded-lg bg-[#1e3c6c] text-white font-bold px-5 w-full" href={next}>Continue</a>
        {email !== "your inbox" && <ResendButton email={email} />}
      </div>
    </div>
  );
} 