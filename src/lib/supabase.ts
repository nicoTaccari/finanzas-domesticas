import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos actualizados
export interface Transaction {
  id?: number;
  user_id?: string;
  household_id: string;
  type: "income" | "expense" | "investment" | "saving";
  amount: number;
  currency_id?: string;
  amount_usd?: number;
  exchange_rate?: number;
  exchange_rate_type?: string;
  description: string;
  category: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Household {
  id: string;
  name: string;
  created_at?: string;
  members?: HouseholdMember[];
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at?: string;
}
