import { Field, Select, Textarea } from "@/components/ui";
import type { Contact } from "@/lib/types";
import { INTEREST_OPTIONS } from "@/lib/utils";

export function ContactForm({
  action,
  contact,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  contact?: Contact;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
      <Field label="Nombre completo" name="full_name" defaultValue={contact?.full_name} placeholder="Ej. Laura Gomez" />
      <Field label="Telefono" name="phone" defaultValue={contact?.phone} placeholder="Ej. +57 3001234567" />
      <Field label="Email" name="email" defaultValue={contact?.email} placeholder="Ej. laura@empresa.com" type="email" />
      <Field label="Empresa" name="company" defaultValue={contact?.company} placeholder="Ej. Truji SAS" />
      <Field label="Cargo" name="role" defaultValue={contact?.role} placeholder="Ej. Directora comercial" />
      <Field label="Ciudad" name="city" defaultValue={contact?.city} placeholder="Ej. Trujillo" />
      <Field label="Instagram" name="instagram" defaultValue={contact?.instagram} placeholder="@usuario" />
      <Field label="LinkedIn" name="linkedin" defaultValue={contact?.linkedin} placeholder="linkedin.com/in/..." />
      <Select label="Interes" name="interest" defaultValue={contact?.interest} options={INTEREST_OPTIONS} />
      <Field label="Origen" name="source" defaultValue={contact?.source} placeholder="Ej. Evento Camara de Comercio" />
      <div className="md:col-span-2">
        <Textarea
          label="Informacion recibida"
          name="raw_capture"
          defaultValue={contact?.raw_capture}
          placeholder="Mensaje libre, nota inicial o contexto base recibido del contacto"
          hint="Puedes guardar aqui el texto original recibido o un resumen inicial para arrancar el seguimiento."
          rows={5}
        />
      </div>
      <div className="md:col-span-2">
        <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}