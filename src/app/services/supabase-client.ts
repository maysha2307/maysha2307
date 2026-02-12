import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Ensure a single Supabase client across HMR / hot-reloads
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __supabase_client__: any | undefined;
}

if (!globalThis.__supabase_client__) {
  globalThis.__supabase_client__ = createClient(
    environment.supabase.url,
    environment.supabase.anonKey
  );
}

// Singleton Supabase client for the whole app
export const supabase = globalThis.__supabase_client__;
