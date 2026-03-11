import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { loginAction } from "@/app/(auth)/login/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getOptionalUser();
  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-card backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <section className="hidden bg-ink px-10 py-14 text-white md:block">
          <Link href="/" className="inline-block transition hover:text-sand">
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">TrujiConnect</p>
            <h1 className="mt-8 max-w-md font-[family-name:var(--font-display)] text-5xl leading-tight">
              Organiza contactos y seguimiento comercial.
            </h1>
          </Link>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Accede con un usuario existente de Supabase Auth para registrar interacciones, proximos pasos y contexto comercial.
          </p>
        </section>
        <section className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mb-8 md:hidden">
            <Link href="/" className="inline-block transition hover:text-teal">
              <p className="text-sm uppercase tracking-[0.35em] text-ink/50">TrujiConnect</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">Acceso privado</h1>
            </Link>
          </div>

          <div className="mb-8 hidden md:block">
            <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Acceso</p>
            <h2 className="mt-2 text-3xl font-semibold">Inicia sesion</h2>
          </div>

          <form action={loginAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink/70">Correo</span>
              <input
                name="email"
                type="email"
                required
                placeholder="nombre@empresa.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink/70">Contrasena</span>
              <input
                name="password"
                type="password"
                required
                placeholder="********"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal"
              />
            </label>

            {params.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {params.error}
              </div>
            ) : null}

            <button className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal">
              Entrar
            </button>
          </form>

          <p className="mt-6 text-sm text-ink/55">
            El acceso solo autentica usuarios ya existentes en Supabase Auth. No se crean cuentas automaticamente desde esta pantalla.
          </p>
        </section>
      </div>
    </main>
  );
}