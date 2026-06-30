import { createClient } from '@supabase/supabase-js'

// SECURITY: this file must NEVER be imported from client components.
// SUPABASE_SERVICE_ROLE_KEY bypasses all row-level security and grants full
// database access. If this ever ends up in client-side JS, it is a critical breach.
if (typeof window !== 'undefined') {
  throw new Error('lib/supabase.js (service role) must only be imported in server-side code (API routes, getServerSideProps)')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Server misconfiguration: Supabase environment variables are not set')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})
