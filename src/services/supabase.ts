import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseUser = User;

