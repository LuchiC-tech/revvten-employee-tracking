import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env'

export function getAdminSupabase() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}


