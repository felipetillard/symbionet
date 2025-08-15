import ResendButton from "./ResendButton";

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string }> }) {
  const params = await searchParams;
  const email = params.email || "your inbox";
  const next = params.next || "/auth/login";
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl border p-6 space-y-4 text-center">
        <h1 className="text-xl font-bold">Confirma tu correo electrónico</h1>
        <p className="text-[#586d8d]">Enviamos un enlace de confirmación a <span className="font-medium text-[#101319]">{email}</span>.</p>
        <p className="text-[#586d8d]">Después de confirmar, haz clic abajo para continuar al inicio de sesión.</p>
        <a className="inline-flex h-12 items-center justify-center rounded-lg bg-[#1e3c6c] text-white font-bold px-5 w-full" href={next}>Continuar</a>
        {email !== "your inbox" && <ResendButton email={email} />}
      </div>
    </div>
  );
} 