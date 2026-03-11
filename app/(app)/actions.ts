"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

function nullIfEmpty(value: FormDataEntryValue | null) {
  const normalized = String(value || "").trim();
  return normalized.length > 0 ? normalized : null;
}

export type DeleteContactsResult = {
  ok: boolean;
  message: string;
  deletedIds: string[];
};

export async function signOutAction() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createContactAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const payload = {
    full_name: nullIfEmpty(formData.get("full_name")),
    phone: nullIfEmpty(formData.get("phone")),
    email: nullIfEmpty(formData.get("email")),
    company: nullIfEmpty(formData.get("company")),
    role: nullIfEmpty(formData.get("role")),
    city: nullIfEmpty(formData.get("city")),
    instagram: nullIfEmpty(formData.get("instagram")),
    linkedin: nullIfEmpty(formData.get("linkedin")),
    interest: nullIfEmpty(formData.get("interest")),
    source: nullIfEmpty(formData.get("source")),
    raw_capture: nullIfEmpty(formData.get("raw_capture")),
    created_by: user.id
  };

  const { data: createdContact, error } = await supabase.from("contacts").insert(payload).select("id, created_by").single();
  if (error) {
    console.error("[contacts:create] insert failed", { userId: user.id, error: error.message, payload });
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  console.info("[contacts:create] inserted", {
    userId: user.id,
    contactId: createdContact.id,
    createdBy: createdContact.created_by
  });

  if (payload.raw_capture && createdContact) {
    const { error: initialEntryError } = await supabase.from("contact_updates").insert({
      contact_id: createdContact.id,
      note: payload.raw_capture,
      interaction_type: "primera_interaccion",
      completed: true,
      created_by: user.id
    });

    if (initialEntryError) {
      redirect(`/?error=${encodeURIComponent(initialEntryError.message)}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function updateContactAction(formData: FormData) {
  const { supabase } = await requireUser();
  const contactId = String(formData.get("id") || "");

  const payload = {
    full_name: nullIfEmpty(formData.get("full_name")),
    phone: nullIfEmpty(formData.get("phone")),
    email: nullIfEmpty(formData.get("email")),
    company: nullIfEmpty(formData.get("company")),
    role: nullIfEmpty(formData.get("role")),
    city: nullIfEmpty(formData.get("city")),
    instagram: nullIfEmpty(formData.get("instagram")),
    linkedin: nullIfEmpty(formData.get("linkedin")),
    interest: nullIfEmpty(formData.get("interest")),
    source: nullIfEmpty(formData.get("source")),
    raw_capture: nullIfEmpty(formData.get("raw_capture"))
  };

  const { error } = await supabase.from("contacts").update(payload).eq("id", contactId);
  if (error) {
    redirect(`/contacts/${contactId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteContactsAction(formData: FormData): Promise<DeleteContactsResult> {
  const { supabase, user } = await requireUser();
  const contactIds = formData
    .getAll("contact_ids")
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (contactIds.length === 0) {
    return {
      ok: false,
      message: "Selecciona al menos un contacto para eliminar.",
      deletedIds: []
    };
  }

  const { data: targetContacts, error: targetError } = await supabase
    .from("contacts")
    .select("id, full_name, created_by")
    .in("id", contactIds)
    .order("created_at", { ascending: false });

  console.info("[contacts:delete] requested", {
    userId: user.id,
    contactIds,
    targetContacts,
    targetError: targetError?.message ?? null
  });

  const { data: deletedContacts, error } = await supabase
    .from("contacts")
    .delete()
    .in("id", contactIds)
    .eq("created_by", user.id)
    .select("id, full_name, created_by");

  if (error) {
    console.error("[contacts:delete] delete failed", {
      userId: user.id,
      contactIds,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });

    return {
      ok: false,
      message: "No fue posible eliminar los contactos seleccionados.",
      deletedIds: []
    };
  }

  console.info("[contacts:delete] deleted", {
    userId: user.id,
    requestedIds: contactIds,
    deletedContacts
  });

  const deletedIds = (deletedContacts || []).map((contact) => contact.id as string);

  if (deletedIds.length !== contactIds.length) {
    console.error("[contacts:delete] ownership or policy mismatch", {
      userId: user.id,
      requestedIds: contactIds,
      targetContacts,
      deletedContacts
    });

    return {
      ok: false,
      message: "La eliminacion no se completo. Revisa la propiedad del contacto o la politica DELETE en Supabase.",
      deletedIds
    };
  }

  revalidatePath("/");
  revalidatePath("/contacts");
  deletedIds.forEach((contactId) => revalidatePath(`/contacts/${contactId}`));

  const contactName = String(formData.get("contact_name") || "").trim();
  const message =
    deletedIds.length === 1
      ? `Contacto '${contactName || deletedContacts?.[0]?.full_name || "sin nombre"}' eliminado.`
      : `${deletedIds.length} contactos eliminados.`;

  return {
    ok: true,
    message,
    deletedIds
  };
}

export async function createUpdateAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const contactId = String(formData.get("contact_id") || "");
  const note = String(formData.get("note") || "").trim();

  if (!note) {
    redirect(`/contacts/${contactId}?error=${encodeURIComponent("Agrega un resumen antes de guardar el registro.")}`);
  }

  const payload = {
    contact_id: contactId,
    note,
    interaction_type: nullIfEmpty(formData.get("interaction_type")),
    next_action: nullIfEmpty(formData.get("next_action")),
    due_date: nullIfEmpty(formData.get("due_date")),
    completed: String(formData.get("completed") || "") === "on",
    created_by: user.id
  };

  const { error } = await supabase.from("contact_updates").insert(payload);
  if (error) {
    redirect(`/contacts/${contactId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}