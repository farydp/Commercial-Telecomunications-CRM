export type UserRole = "admin" | "viewer";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
};

export type Contact = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  city: string | null;
  instagram: string | null;
  linkedin: string | null;
  interest: string | null;
  source: string | null;
  raw_capture: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "display_name" | "email"> | null;
};

export type ContactUpdate = {
  id: string;
  contact_id: string;
  note: string;
  interaction_type: string | null;
  next_action: string | null;
  due_date: string | null;
  completed: boolean;
  created_by: string;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "email"> | null;
};
