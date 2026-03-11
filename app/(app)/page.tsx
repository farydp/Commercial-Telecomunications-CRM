import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Card, PageShell } from "@/components/ui";
import { PeriodAreaChart } from "@/components/charts";
import { requireUser } from "@/lib/auth";
import type { Contact, ContactUpdate } from "@/lib/types";
import { formatNullable } from "@/lib/utils";

type DashboardContact = Pick<Contact, "id" | "full_name" | "company" | "email" | "created_at" | "updated_at">;
type DashboardUpdate = Pick<ContactUpdate, "id" | "contact_id" | "note" | "next_action" | "due_date" | "completed" | "created_at"> & {
  contacts?: { full_name: string | null; company: string | null } | null;
};

type RawDashboardUpdate = Pick<ContactUpdate, "id" | "contact_id" | "note" | "next_action" | "due_date" | "completed" | "created_at"> & {
  contacts?: Array<{ full_name: string | null; company: string | null }> | null;
};

function sortByDate(value: string | null) {
  return value ? Date.parse(value) : Number.MAX_SAFE_INTEGER;
}

export default async function DashboardPage() {
  const { supabase } = await requireUser();

  const [{ data: contacts = [] }, { data: updates = [] }] = await Promise.all([
    supabase.from("contacts").select("id, full_name, company, email, created_at, updated_at").order("updated_at", { ascending: false }),
    supabase
      .from("contact_updates")
      .select("id, contact_id, note, next_action, due_date, completed, created_at, contacts(full_name, company)")
      .order("created_at", { ascending: false })
  ]);

  const typedContacts = contacts as DashboardContact[];
  const typedUpdates = (updates as RawDashboardUpdate[]).map((item) => ({
    ...item,
    contacts: item.contacts?.[0] ?? null
  })) as DashboardUpdate[];
  const recentThreshold = subDays(new Date(), 7);
  const pendingUpdates = typedUpdates
    .filter((item) => !item.completed)
    .sort((left, right) => sortByDate(left.due_date) - sortByDate(right.due_date));
  const pendingContactIds = new Set(pendingUpdates.map((item) => item.contact_id));
  const recentActivityIds = new Set(
    typedContacts.filter((contact) => new Date(contact.created_at) >= recentThreshold).map((contact) => contact.id)
  );

  typedUpdates.forEach((item) => {
    if (new Date(item.created_at) >= recentThreshold) {
      recentActivityIds.add(item.contact_id);
    }
  });

  const totalContacts = typedContacts.length;
  const pendingFollowUpCount = pendingContactIds.size;
  const recentActivityCount = recentActivityIds.size;
  const noNextStepContacts = typedContacts.filter((contact) => !pendingContactIds.has(contact.id));
  const noNextStepCount = noNextStepContacts.length;
  const periodData = Array.from({ length: 7 }).map((_, index) => {
    const targetDate = subDays(new Date(), 6 - index);
    const dayKey = format(targetDate, "dd/MM");
    const total = typedContacts.filter((contact) => format(parseISO(contact.created_at), "dd/MM") === dayKey).length;
    return { day: dayKey, total };
  });

  return (
    <PageShell>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total contactos", value: totalContacts },
          { label: "Con seguimiento pendiente", value: pendingFollowUpCount },
          { label: "Con actividad reciente", value: recentActivityCount },
          { label: "Sin seguimiento proximo", value: noNextStepCount }
        ].map((item) => (
          <Card key={item.label} className="bg-white/90">
            <p className="text-sm text-ink/55">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Actividad</p>
              <h2 className="mt-2 text-2xl font-semibold">Contactos por periodo</h2>
            </div>
          </div>
          <PeriodAreaChart data={periodData} />
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Vista comercial</p>
          <h2 className="mt-2 text-2xl font-semibold">Cobertura de seguimiento</h2>
          <p className="mt-3 text-sm leading-6 text-ink/60">
            El tablero prioriza proximos pasos y actividad reciente para reflejar mejor el trabajo comercial real del MVP.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              {
                label: "Seguimiento pendiente",
                value: `${pendingFollowUpCount} contactos`,
                tone: "bg-amber-50 text-amber-800"
              },
              {
                label: "Actividad reciente",
                value: `${recentActivityCount} contactos en los ultimos 7 dias`,
                tone: "bg-emerald-50 text-emerald-800"
              },
              {
                label: "Sin proximo paso",
                value: `${noNextStepCount} contactos por revisar`,
                tone: "bg-slate-100 text-slate-700"
              }
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl px-4 py-4 ${item.tone}`}>
                <p className="text-xs uppercase tracking-[0.2em]">{item.label}</p>
                <p className="mt-2 text-base font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Seguimiento</p>
              <h2 className="mt-2 text-2xl font-semibold">Proximos pasos</h2>
            </div>
            <Link href="/contacts" className="text-sm font-medium text-teal">
              Ver contactos
            </Link>
          </div>
          <div className="space-y-3">
            {pendingUpdates.length === 0 ? (
              <div className="rounded-2xl bg-sand px-4 py-5 text-sm text-ink/60">No hay seguimientos pendientes.</div>
            ) : (
              pendingUpdates.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{formatNullable(item.contacts?.full_name, "Contacto sin nombre")}</p>
                      <p className="truncate text-sm text-ink/55">{formatNullable(item.contacts?.company)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
                      {item.due_date ? format(parseISO(item.due_date), "dd MMM", { locale: es }) : "Sin fecha"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink/70">{formatNullable(item.next_action, item.note)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Pendientes de definir</p>
          <h2 className="mt-2 text-2xl font-semibold">Contactos sin seguimiento proximo</h2>
          <div className="mt-5 space-y-3">
            {noNextStepContacts.length === 0 ? (
              <div className="rounded-2xl bg-sand px-4 py-5 text-sm text-ink/60">Todos los contactos tienen al menos un proximo paso pendiente.</div>
            ) : (
              noNextStepContacts.slice(0, 6).map((contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="block rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-teal">
                  <p className="font-semibold">{formatNullable(contact.full_name, "Contacto sin nombre")}</p>
                  <p className="mt-1 text-sm text-ink/55">{formatNullable(contact.company)}</p>
                  <p className="mt-2 break-all text-sm text-ink/65">{formatNullable(contact.email, "Sin email")}</p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}