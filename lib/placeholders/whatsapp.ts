export type ParsedContactDraft = {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string;
  raw_capture: string;
};

export function parseWhatsAppCapture(rawText: string): ParsedContactDraft {
  const text = rawText.trim();
  const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return {
    full_name: null,
    phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, " ").trim() : null,
    email: emailMatch ? emailMatch[0] : null,
    company: null,
    source: "whatsapp_pending",
    raw_capture: text
  };
}


