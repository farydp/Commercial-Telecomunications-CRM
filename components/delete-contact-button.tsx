"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeleteContactsResult } from "@/app/(app)/actions";

export function DeleteContactButton({
  contactId,
  contactName,
  deleteAction,
  redirectToContacts = false
}: {
  contactId: string;
  contactName: string;
  deleteAction: (formData: FormData) => Promise<DeleteContactsResult>;
  redirectToContacts?: boolean;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Eliminar a ${contactName}?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("contact_ids", contactId);
    formData.append("contact_name", contactName);

    startTransition(async () => {
      setFeedback(null);
      setError(null);
      const result = await deleteAction(formData);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      if (redirectToContacts) {
        router.push(`/contacts?success=${encodeURIComponent(result.message)}`);
        router.refresh();
        return;
      }

      setFeedback(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        Eliminar contacto
      </button>
      {feedback ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}