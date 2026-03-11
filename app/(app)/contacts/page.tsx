import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { deleteContactsAction } from "@/app/(app)/actions";
import { ContactsList } from "@/components/contacts-list";
import { Card, PageShell } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import type { Contact, ContactUpdate } from "@/lib/types";

function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

type Props = {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>;
};

type ContactRow = Pick<Contact, "id" | "full_name" | "city" | "company" | "phone" | "raw_capture" | "updated_at">;
type ContactListUpdate = Pick<ContactUpdate, "contact_id" | "next_action" | "due_date" | "completed" | "created_at">;

function sortByDueDate(left: ContactListUpdate, right: ContactListUpdate) {
  const leftValue = left.due_date ? Date.parse(left.due_date) : Number.MAX_SAFE_INTEGER;
  const rightValue = right.due_date ? Date.parse(right.due_date) : Number.MAX_SAFE_INTEGER;
  return leftValue - rightValue;
}

function compactContext(value: string | null) {
  if (!hasValue(value)) {
    return undefined;
  }

  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  return normalized.length > 96 ? `${normalized.slice(0, 93)}...` : normalized;
}

export default async function ContactsPage({ searchParams }: Props) {
  const { supabase, profile } = await requireUser();
  const params = await searchParams;
  const currentQuery = params.q?.trim() || "";
  const canManage = profile.role === "admin";
  let query = supabase.from("contacts").select("id, full_name, city, company, phone, raw_capture, updated_at").order("updated_at", { ascending: false });

  if (currentQuery) {
    query = query.or(`full_name.ilike.%${currentQuery}%,company.ilike.%${currentQuery}%,phone.ilike.%${currentQuery}%,email.ilike.%${currentQuery}%`);
  }

  const { data: contacts = [] } = await query;
  const typedContacts = contacts as ContactRow[];
  const contactIds = typedContacts.map((contact) => contact.id);
  const { data: updates = [] } = contactIds.length
    ? await supabase
        .from("contact_updates")
        .select("contact_id, next_action, due_date, completed, created_at")
        .in("contact_id", contactIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const typedUpdates = updates as ContactListUpdate[];
  const phones = typedContacts.map((contact) => contact.phone).filter(Boolean);
  const duplicatePhones = new Set(phones.filter((phone, index) => phones.indexOf(phone) !== index));
  const latestUpdateByContact = new Map<string, ContactListUpdate>();
  const pendingUpdateByContact = new Map<string, ContactListUpdate>();

  typedUpdates.forEach((item) => {
    if (!latestUpdateByContact.has(item.contact_id)) {
      latestUpdateByContact.set(item.contact_id, item);
    }
  });

  typedUpdates
    .filter((item) => !item.completed)
    .sort(sortByDueDate)
    .forEach((item) => {
      if (!pendingUpdateByContact.has(item.contact_id)) {
        pendingUpdateByContact.set(item.contact_id, item);
      }
    });

  const listItems = typedContacts.map((contact) => {
    const pendingUpdate = pendingUpdateByContact.get(contact.id);
    const latestUpdate = latestUpdateByContact.get(contact.id);
    const fullName = (contact.full_name && contact.full_name.trim()) || (contact.phone && contact.phone.trim()) || (contact.company && contact.company.trim()) || "Contacto";

    if (pendingUpdate) {
      return {
        id: contact.id,
        fullName,
        phone: hasValue(contact.phone) ? contact.phone!.trim() : undefined,
        company: hasValue(contact.company) ? contact.company!.trim() : undefined,
        location: hasValue(contact.city) ? contact.city!.trim() : undefined,
        context: compactContext(contact.raw_capture),
        trackingTitle: "Proximo paso",
        trackingBody: (pendingUpdate.next_action && pendingUpdate.next_action.trim()) || "Seguimiento pendiente",
        trackingMeta: pendingUpdate.due_date ? format(parseISO(pendingUpdate.due_date), "dd MMM yyyy", { locale: es }) : "Sin fecha objetivo",
        trackingTone: "pending" as const,
        duplicatePhone: Boolean(contact.phone && duplicatePhones.has(contact.phone))
      };
    }

    if (latestUpdate) {
      return {
        id: contact.id,
        fullName,
        phone: hasValue(contact.phone) ? contact.phone!.trim() : undefined,
        company: hasValue(contact.company) ? contact.company!.trim() : undefined,
        location: hasValue(contact.city) ? contact.city!.trim() : undefined,
        context: compactContext(contact.raw_capture),
        trackingTitle: "Ultima interaccion",
        trackingBody: "Sin seguimiento pendiente",
        trackingMeta: format(parseISO(latestUpdate.created_at), "dd MMM yyyy", { locale: es }),
        trackingTone: "recent" as const,
        duplicatePhone: Boolean(contact.phone && duplicatePhones.has(contact.phone))
      };
    }

    return {
      id: contact.id,
      fullName,
      phone: hasValue(contact.phone) ? contact.phone!.trim() : undefined,
      company: hasValue(contact.company) ? contact.company!.trim() : undefined,
      location: hasValue(contact.city) ? contact.city!.trim() : undefined,
      context: compactContext(contact.raw_capture),
      trackingTitle: "",
      trackingBody: "Sin seguimiento proximo",
      trackingMeta: "",
      trackingTone: "empty" as const,
      duplicatePhone: Boolean(contact.phone && duplicatePhones.has(contact.phone))
    };
  });

  return (
    <PageShell>
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Base comercial</p>
            <h2 className="mt-2 text-3xl font-semibold">Contactos</h2>
          </div>
          {canManage ? (
            <Link href="/contacts/new" className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal">
              Crear contacto
            </Link>
          ) : null}
        </div>

        {params.success ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</div> : null}
        {params.error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</div> : null}

        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            name="q"
            defaultValue={currentQuery}
            placeholder="Buscar por nombre, empresa, email o telefono"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
          />
          <button className="rounded-2xl border border-slate-200 bg-sand px-4 py-3 text-sm font-semibold text-ink">Filtrar</button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <ContactsList contacts={listItems} deleteAction={deleteContactsAction} canManage={canManage} />
      </Card>
    </PageShell>
  );
}
