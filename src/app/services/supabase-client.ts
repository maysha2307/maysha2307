import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Singleton Supabase client for the whole app
export const supabase = createClient(
  environment.supabase.url,
  environment.supabase.anonKey
);
