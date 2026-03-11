"use client";

import { useState } from "react";
import { Field, Select, Textarea } from "@/components/ui";
import { INTERACTION_OPTIONS } from "@/lib/utils";

export function UpdateForm({
  action,
  contactId
}: {
  action: (formData: FormData) => Promise<void>;
  contactId: string;
}) {
  const [completed, setCompleted] = useState(false);
  const dateLabel = completed ? "Fecha de interaccion" : "Fecha objetivo";
  const dateHint = completed
    ? "Usala si quieres dejar explicito cuando ocurrio esta interaccion."
    : "Define cuando deberia ejecutarse el proximo paso.";
  const nextStepLabel = completed ? "Accion realizada" : "Proximo paso";
  const nextStepPlaceholder = completed ? "Ej. Se envio propuesta comercial" : "Ej. Enviar propuesta comercial";

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="contact_id" value={contactId} />
      <Textarea
        label="Resumen"
        name="note"
        placeholder="Que paso, que se acordo, que objecion aparecio o que informacion llego."
        hint="Este texto sera el registro principal dentro del historial comercial."
        rows={5}
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Tipo de registro"
          name="interaction_type"
          options={INTERACTION_OPTIONS}
          hint="Selecciona la interaccion mas cercana al contexto del avance."
        />
        <Field
          label={nextStepLabel}
          name="next_action"
          placeholder={nextStepPlaceholder}
          hint={completed ? "Opcional. Sirve para dejar claro que accion ya quedo hecha." : "Opcional. Describe la siguiente accion acordada."}
        />
        <Field label={dateLabel} name="due_date" type="date" hint={dateHint} />
        <label className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink/70">
          <span className="flex items-center gap-3 font-medium">
            <input
              type="checkbox"
              name="completed"
              checked={completed}
              onChange={(event) => setCompleted(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Este registro ya se realizo
          </span>
          <span className="mt-2 text-xs text-ink/50">
            Activalo para guardar una interaccion completada. Si queda apagado, se entendera como un proximo paso pendiente.
          </span>
        </label>
      </div>
      <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal">
        Guardar registro
      </button>
    </form>
  );
}