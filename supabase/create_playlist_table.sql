-- Create playlist_songs table for storing shared playlist
CREATE TABLE IF NOT EXISTS public.playlist_songs (
	id text PRIMARY KEY,
	title text,
	artist text,
	album text,
	album_art text,
	preview_url text,
	added_at timestamptz,
	note text
);

-- Allow anon full access for quick testing (tighten before production)
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY anon_full_access ON public.playlist_songs FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

-- Optional index on added_at for ordering
CREATE INDEX IF NOT EXISTS idx_playlist_added_at ON public.playlist_songs (added_at DESC);

