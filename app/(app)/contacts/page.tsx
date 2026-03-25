import Link from "next/link";
import type { Route } from "next";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { deleteContactsAction } from "@/app/(app)/actions";
import { ContactsControls } from "@/components/contacts-controls";
import { ContactsList } from "@/components/contacts-list";
import { Card, PageShell } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import type { Contact, ContactUpdate } from "@/lib/types";

const PAGE_SIZE = 10;
const SORT_FIELDS = ["company", "person"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;
type SortField = (typeof SORT_FIELDS)[number];
type SortDirection = (typeof SORT_DIRECTIONS)[number];

function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

type Props = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    page?: string;
    company?: string;
    person?: string;
    sortField?: string;
    sortDirection?: string;
  }>;
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

function parseSortField(value?: string): SortField {
  return SORT_FIELDS.includes(value as SortField) ? (value as SortField) : "company";
}

function parseSortDirection(value?: string): SortDirection {
  return SORT_DIRECTIONS.includes(value as SortDirection) ? (value as SortDirection) : "asc";
}

function buildContactsPageHref(
  page: number,
  companyPrefix: string,
  personPrefix: string,
  sortField: SortField,
  sortDirection: SortDirection
): Route {
  const params = new URLSearchParams();

  if (companyPrefix) {
    params.set("company", companyPrefix);
  }

  if (personPrefix) {
    params.set("person", personPrefix);
  }

  if (sortField !== "company") {
    params.set("sortField", sortField);
  }

  if (sortDirection !== "asc") {
    params.set("sortDirection", sortDirection);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return (queryString ? `/contacts?${queryString}` : "/contacts") as Route;
}

export default async function ContactsPage({ searchParams }: Props) {
  const { supabase, profile } = await requireUser();
  const params = await searchParams;
  const companyPrefix = params.company?.trim() || "";
  const personPrefix = params.person?.trim() || "";
  const sortField = parseSortField(params.sortField);
  const sortDirection = parseSortDirection(params.sortDirection);
  const isAscending = sortDirection === "asc";
  const requestedPage = Number(params.page || "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
  const canManage = profile.role === "admin";
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase.from("contacts").select("id, full_name, city, company, phone, raw_capture, updated_at", { count: "exact" });

  if (companyPrefix) {
    query = query.ilike("company", `${companyPrefix}%`);
  }

  if (personPrefix) {
    query = query.or(`full_name.ilike.${personPrefix}%,full_name.ilike.% ${personPrefix}%`);
  }

  if (sortField === "person") {
    query = query.order("full_name", { ascending: isAscending, nullsFirst: false });
    query = query.order("company", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("company", { ascending: isAscending, nullsFirst: false });
    query = query.order("full_name", { ascending: true, nullsFirst: false });
  }

  query = query.order("updated_at", { ascending: false });
  query = query.range(from, to);

  const { data: contacts = [], count = 0 } = await query;
  const totalContacts = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalContacts / PAGE_SIZE));
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
  const visibleFrom = totalContacts === 0 ? 0 : from + 1;
  const visibleTo = totalContacts === 0 ? 0 : from + typedContacts.length;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

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

        <ContactsControls companyPrefix={companyPrefix} personPrefix={personPrefix} />
      </Card>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/60">
            Mostrando {visibleFrom}-{visibleTo} de {totalContacts} contacto{totalContacts === 1 ? "" : "s"}
          </p>
          {totalContacts > PAGE_SIZE ? <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Pagina {currentPage} de {totalPages}</p> : null}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <ContactsList
          contacts={listItems}
          deleteAction={deleteContactsAction}
          canManage={canManage}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </Card>

      {totalContacts > PAGE_SIZE ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={hasPreviousPage ? buildContactsPageHref(currentPage - 1, companyPrefix, personPrefix, sortField, sortDirection) : "#"}
            aria-disabled={!hasPreviousPage}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              hasPreviousPage
                ? "border border-slate-200 bg-white text-ink hover:bg-sand"
                : "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={hasNextPage ? buildContactsPageHref(currentPage + 1, companyPrefix, personPrefix, sortField, sortDirection) : "#"}
            aria-disabled={!hasNextPage}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              hasNextPage
                ? "border border-slate-200 bg-white text-ink hover:bg-sand"
                : "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            Siguiente
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}
