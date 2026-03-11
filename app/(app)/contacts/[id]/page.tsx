import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { createUpdateAction, deleteContactsAction, updateContactAction } from "@/app/(app)/actions";
import { ContactForm } from "@/components/contact-form";
import { DeleteContactButton } from "@/components/delete-contact-button";
import { UpdateForm } from "@/components/update-form";
import { Card, PageShell } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import type { Contact, ContactUpdate } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string; edit?: string }>;
};

function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function formatEntryTitle(interactionType: string | null) {
  if (interactionType === "primera_interaccion") {
    return "Primera interaccion";
  }

  return interactionType && interactionType.trim().length > 0 ? interactionType : "nota";
}

function formatEntryBadge(item: ContactUpdate) {
  if (item.interaction_type === "primera_interaccion") {
    return { label: "registrada", className: "bg-sky-100 text-sky-700" };
  }

  if (item.completed) {
    return { label: "realizado", className: "bg-emerald-100 text-emerald-700" };
  }

  return { label: "pendiente", className: "bg-amber-100 text-amber-700" };
}

export default async function ContactDetailPage({ params, searchParams }: Props) {
  const { supabase } = await requireUser();
  const { id } = await params;
  const { error, success, edit } = await searchParams;
  const isEditing = edit === "1";

  const [{ data: contact }, { data: updates = [] }] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase.from("contact_updates").select("*, profiles(display_name, email)").eq("contact_id", id).order("created_at", { ascending: false })
  ]);

  const typedContact = contact as Contact | null;
  const typedUpdates = updates as ContactUpdate[];
  const contactName = (typedContact?.full_name && typedContact.full_name.trim()) || (typedContact?.phone && typedContact.phone.trim()) || "Contacto";
  const detailItems = typedContact
    ? [
        { label: "Telefono", value: typedContact.phone, breakValue: false },
        { label: "Email", value: typedContact.email, breakValue: true },
        { label: "Cargo", value: typedContact.role, breakValue: false },
        { label: "Ciudad", value: typedContact.city, breakValue: false },
        { label: "Instagram", value: typedContact.instagram, breakValue: true },
        { label: "LinkedIn", value: typedContact.linkedin, breakValue: true },
        { label: "Interes", value: typedContact.interest, breakValue: false },
        { label: "Origen", value: typedContact.source, breakValue: true }
      ].filter((item) => hasValue(item.value))
    : [];

  if (!typedContact) {
    return (
      <PageShell>
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Contacto no encontrado</h2>
            <Link href="/contacts" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand">
              Volver a contactos
            </Link>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Detalle</p>
                <h2 className="mt-2 text-3xl font-semibold">{contactName}</h2>
                {hasValue(typedContact.company) ? <p className="mt-2 text-sm text-ink/60">{typedContact.company}</p> : null}
              </div>
              <div className="flex flex-wrap items-start justify-end gap-3">
                <Link href="/contacts" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand">
                  Volver a contactos
                </Link>
                <Link
                  href={isEditing ? `/contacts/${typedContact.id}` : `/contacts/${typedContact.id}?edit=1`}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand"
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Link>
                <DeleteContactButton
                  contactId={typedContact.id}
                  contactName={contactName}
                  deleteAction={deleteContactsAction}
                  redirectToContacts
                />
                <div className="rounded-2xl bg-sand px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Actualizado</p>
                  <p className="mt-2 text-sm font-medium">{format(parseISO(typedContact.updated_at), "dd MMM yyyy", { locale: es })}</p>
                </div>
              </div>
            </div>

            {success ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            {detailItems.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-sand px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{item.label}</p>
                    <p className={`mt-2 text-sm font-medium ${item.breakValue ? "break-all leading-5" : "break-words"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {hasValue(typedContact.raw_capture) ? (
              <div className="mt-6 rounded-3xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Informacion recibida</p>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-ink/70">{typedContact.raw_capture}</p>
              </div>
            ) : null}
          </Card>

          {isEditing && (
            <Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Edicion</p>
                  <h3 className="mt-2 text-2xl font-semibold">Contacto</h3>
                </div>
              </div>

              <div className="mt-6">
                <ContactForm action={updateContactAction} contact={typedContact} submitLabel="Guardar cambios" />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Seguimiento</p>
            <h3 className="mt-2 text-2xl font-semibold">Registrar interaccion o proximo paso</h3>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              Guarda interacciones realizadas o deja programado el siguiente movimiento comercial sin mezclar ambos conceptos.
            </p>
            <UpdateForm action={createUpdateAction} contactId={typedContact.id} />
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Timeline</p>
            <h3 className="mt-2 text-2xl font-semibold">Historial comercial</h3>
            <div className="mt-6 space-y-4">
              {typedUpdates.length === 0 ? (
                <div className="rounded-2xl bg-sand px-4 py-5 text-sm text-ink/60">Aun no hay registros de seguimiento.</div>
              ) : (
                typedUpdates.map((item) => {
                  const badge = formatEntryBadge(item);
                  const dateLabel = item.completed ? "Fecha de interaccion" : "Fecha objetivo";

                  return (
                    <div key={item.id} className="relative rounded-3xl border border-slate-200 px-5 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">{formatEntryTitle(item.interaction_type)}</p>
                          <p className="mt-1 text-xs text-ink/45">
                            {format(parseISO(item.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badge.className}`}>{badge.label}</span>
                      </div>

                      {item.interaction_type === "primera_interaccion" && hasValue(typedContact.source) ? (
                        <div className="mt-4 inline-flex rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink/70">
                          Origen: {typedContact.source}
                        </div>
                      ) : null}

                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-ink/70">{item.note}</p>

                      {item.next_action || item.due_date ? (
                        <div className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm">
                          {item.next_action ? (
                            <>
                              <p className="font-medium">{item.completed ? "Accion realizada" : "Proximo paso"}</p>
                              <p className="mt-1 break-words text-ink/65">{item.next_action}</p>
                            </>
                          ) : null}
                          <p className="mt-2 text-xs text-ink/45">
                            {item.due_date
                              ? `${dateLabel}: ${format(parseISO(item.due_date), "dd MMM yyyy", { locale: es })}`
                              : item.completed
                                ? "Sin fecha de interaccion definida"
                                : "Sin fecha objetivo definida"}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
