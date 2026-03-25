import { redirect } from "next/navigation";
import { createContactAction } from "@/app/(app)/actions";
import { ContactForm } from "@/components/contact-form";
import { Card, PageShell } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function NewContactPage() {
  const { profile } = await requireUser();

  if (profile.role !== "admin") {
    redirect("/contacts");
  }

  return (
    <PageShell>
      <Card>
        <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Nuevo registro</p>
        <h2 className="mt-2 text-3xl font-semibold">Crear contacto</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Organiza contactos y seguimiento comercial desde la primera nota, incluso cuando la informacion aun no esta completa.
        </p>
        <div className="mt-6">
          <ContactForm action={createContactAction} submitLabel="Guardar contacto" />
        </div>
      </Card>
    </PageShell>
  );
}

