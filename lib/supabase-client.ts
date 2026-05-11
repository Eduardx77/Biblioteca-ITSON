import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

// Adaptador de almacenamiento para Next.js
const localStorage: any = typeof window !== "undefined" ? window.localStorage : null

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: localStorage || {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          },
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : ({
        auth: {
          signInWithPassword: async () => ({ data: null, error: new Error("Supabase no configurado") }),
          resetPasswordForEmail: async () => ({ data: null, error: new Error("Supabase no configurado") }),
        },
      } as any)

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
