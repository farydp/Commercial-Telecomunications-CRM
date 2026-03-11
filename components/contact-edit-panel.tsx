"use client";

import { useState } from "react";
import { ContactForm } from "@/components/contact-form";
import type { Contact } from "@/lib/types";

export function ContactEditPanel({
  action,
  contact,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  contact: Contact;
  submitLabel: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Edicion</p>
          <h3 className="mt-2 text-2xl font-semibold">Contacto</h3>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand"
            >
              Cancelar
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand"
          >
            {isEditing ? "Ocultar" : "Editar"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-6">
          <ContactForm action={action} contact={contact} submitLabel={submitLabel} />
        </div>
      ) : null}
    </div>
  );
}