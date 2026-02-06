-- Create bucket_items table for dreams / bucket list
CREATE TABLE IF NOT EXISTS public.bucket_items (
	id text PRIMARY KEY,
	title text NOT NULL,
	description text,
	category text,
	is_completed boolean DEFAULT false,
	completed_date timestamptz,
	completed_note text,
	created_at timestamptz,
	emoji text
);

-- Allow anon full access for quick testing (tighten before production)
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY anon_full_access ON public.bucket_items FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

CREATE INDEX IF NOT EXISTS idx_bucket_created_at ON public.bucket_items (created_at DESC);

