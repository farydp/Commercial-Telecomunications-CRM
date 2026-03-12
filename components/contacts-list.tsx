"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { DeleteContactsResult } from "@/app/(app)/actions";

type ContactsListItem = {
  id: string;
  fullName: string;
  phone?: string;
  company?: string;
  location?: string;
  context?: string;
  trackingTitle: string;
  trackingBody: string;
  trackingMeta: string;
  trackingTone: "pending" | "recent" | "empty";
  duplicatePhone: boolean;
};

const toneClasses = {
  pending: "bg-amber-50 text-amber-900",
  recent: "bg-slate-50 text-slate-700",
  empty: "bg-transparent text-ink/55"
} as const;

export function ContactsList({
  contacts,
  deleteAction,
  canManage
}: {
  contacts: ContactsListItem[];
  deleteAction: (formData: FormData) => Promise<DeleteContactsResult>;
  canManage: boolean;
}) {
  const [rows, setRows] = useState(contacts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;
  const columnCount = canManage ? 6 : 4;

  useEffect(() => {
    setRows(contacts);
    setSelectedIds([]);
  }, [contacts]);

  function toggleSelection(contactId: string) {
    setSelectedIds((current) =>
      current.includes(contactId) ? current.filter((item) => item !== contactId) : [...current, contactId]
    );
  }

  function runDelete(contactIds: string[], contactName?: string) {
    const formData = new FormData();
    contactIds.forEach((contactId) => formData.append("contact_ids", contactId));
    if (contactName) {
      formData.set("contact_name", contactName);
    }

    startTransition(async () => {
      const result = await deleteAction(formData);

      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      const deletedIds = new Set(result.deletedIds);
      setRows((current) => current.filter((contact) => !deletedIds.has(contact.id)));
      setSelectedIds((current) => current.filter((contactId) => !deletedIds.has(contactId)));
      setFeedback({ type: "success", message: result.message });
    });
  }

  function handleBulkDelete() {
    if (!canManage || !hasSelection || !window.confirm(`Eliminar ${selectedCount} contacto${selectedCount === 1 ? "" : "s"}?`)) {
      return;
    }

    runDelete(selectedIds);
  }

  function handleSingleDelete(contactId: string, contactName: string) {
    if (!canManage || !window.confirm(`Eliminar a ${contactName}?`)) {
      return;
    }

    runDelete([contactId], contactName);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {feedback ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : <div />}
        {canManage ? (
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={!hasSelection || isPending}
            className="w-full rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition enabled:hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:w-auto"
          >
            Eliminar seleccionados
          </button>
        ) : null}
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-sand px-4 py-10 text-center text-sm text-ink/55">No hay contactos con esos filtros.</div>
        ) : (
          rows.map((contact) => {
            const isSelected = selectedIds.includes(contact.id);
            return (
              <article key={contact.id} className="rounded-3xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/contacts/${contact.id}`} className="block break-words font-semibold text-ink hover:text-teal">
                      {contact.fullName}
                    </Link>
                    {contact.phone ? <p className="mt-2 break-words text-sm font-medium text-ink">{contact.phone}</p> : null}
                    {contact.company ? <p className="mt-1 break-words text-sm text-ink/70">{contact.company}</p> : null}
                    {contact.location ? <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/50">{contact.location}</p> : null}
                  </div>
                  {canManage ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(contact.id)}
                      aria-label={`Seleccionar a ${contact.fullName}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                    />
                  ) : null}
                </div>

                {contact.context ? <p className="mt-4 break-words text-sm leading-5 text-ink/65">{contact.context}</p> : null}

                <div className="mt-4">
                  {contact.trackingTone === "empty" ? (
                    <p className="text-sm text-ink/55">{contact.trackingBody}</p>
                  ) : (
                    <div className={`rounded-2xl px-3 py-3 ${toneClasses[contact.trackingTone]}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{contact.trackingTitle}</p>
                      <p className="mt-2 break-words text-sm leading-5">{contact.trackingBody}</p>
                      <p className="mt-2 text-xs opacity-80">{contact.trackingMeta}</p>
                    </div>
                  )}
                </div>

                {contact.duplicatePhone ? <p className="mt-4 text-xs text-amber-700">Telefono duplicado</p> : null}

                {canManage ? (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSingleDelete(contact.id, contact.fullName)}
                      disabled={isPending}
                      className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand/80 text-ink/60">
            <tr>
              {canManage ? <th className="w-12 px-5 py-4 font-medium"></th> : null}
              <th className="px-5 py-4 font-medium">Contacto</th>
              <th className="px-5 py-4 font-medium">Contexto</th>
              <th className="px-5 py-4 font-medium">Seguimiento</th>
              <th className="px-5 py-4 font-medium">Alertas</th>
              {canManage ? <th className="px-5 py-4 font-medium text-right">Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-10 text-center text-ink/55">
                  No hay contactos con esos filtros.
                </td>
              </tr>
            ) : (
              rows.map((contact) => {
                const isSelected = selectedIds.includes(contact.id);
                return (
                  <tr key={contact.id} className="border-t border-slate-100 align-top">
                    {canManage ? (
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(contact.id)}
                          aria-label={`Seleccionar a ${contact.fullName}`}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                    ) : null}
                    <td className="px-5 py-4">
                      <Link href={`/contacts/${contact.id}`} className="font-semibold text-ink hover:text-teal">
                        {contact.fullName}
                      </Link>
                      {contact.phone ? <p className="mt-2 text-sm font-medium text-ink">{contact.phone}</p> : null}
                      {contact.company ? <p className="mt-2 text-sm text-ink/70">{contact.company}</p> : null}
                      {contact.location ? <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/50">{contact.location}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      {contact.context ? <p className="max-w-[18rem] text-sm leading-5 text-ink/65">{contact.context}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      {contact.trackingTone === "empty" ? (
                        <p className="text-sm text-ink/55">{contact.trackingBody}</p>
                      ) : (
                        <div className={`max-w-[18rem] rounded-2xl px-3 py-3 ${toneClasses[contact.trackingTone]}`}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">{contact.trackingTitle}</p>
                          <p className="mt-2 break-words text-sm leading-5">{contact.trackingBody}</p>
                          <p className="mt-2 text-xs opacity-80">{contact.trackingMeta}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-amber-700">{contact.duplicatePhone ? "Telefono duplicado" : "-"}</td>
                    {canManage ? (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSingleDelete(contact.id, contact.fullName)}
                          disabled={isPending}
                          className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          Eliminar
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
