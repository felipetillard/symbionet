import SignupForm from "./SignupForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-[#1e3c6c]" />
          <span className="text-lg font-bold tracking-tight">Stitch Design</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-white/70">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid md:grid-cols-2 gap-10 items-center pt-10">
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Lanza tu tienda multi-inquilino en minutos
            </h1>
            <p className="text-white/70 text-lg">
              Escaparate hermoso, administración de inquilinos y gestión de productos. Impulsado por Next.js y Supabase.
            </p>
            <ul className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400"/>Datos aislados por inquilino</li>
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400"/>Subidas de admin e inventario</li>
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400"/>Seguro con RLS por defecto</li>
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400"/>Kit de UI Tailwind</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Crea tu tienda</h2>
            <SignupForm />
          </div>
        </section>
      </main>
    </div>
  );
}
