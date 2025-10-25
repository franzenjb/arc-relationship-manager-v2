-- Geocoding Cache Table
-- Professional-grade caching for geocoding results

CREATE TABLE IF NOT EXISTS geocoding_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key text NOT NULL UNIQUE,
    original_address text NOT NULL,
    latitude decimal(10, 8) NOT NULL,
    longitude decimal(11, 8) NOT NULL,
    formatted_address text NOT NULL,
    accuracy text NOT NULL CHECK (accuracy IN ('EXACT', 'APPROXIMATE', 'FALLBACK')),
    provider text NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_key ON geocoding_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_expires ON geocoding_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_provider ON geocoding_cache(provider);

-- RLS Policy (if using Row Level Security)
ALTER TABLE geocoding_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write geocoding cache
CREATE POLICY "Allow geocoding cache access" ON geocoding_cache
    FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE geocoding_cache IS 'Professional geocoding cache for address-to-coordinate lookups';
COMMENT ON COLUMN geocoding_cache.cache_key IS 'Base64 encoded cache key derived from normalized address';
COMMENT ON COLUMN geocoding_cache.accuracy IS 'Geocoding accuracy level: EXACT (building), APPROXIMATE (city), FALLBACK (state center)';
COMMENT ON COLUMN geocoding_cache.provider IS 'Geocoding service provider (nominatim, google, etc.)';
COMMENT ON COLUMN geocoding_cache.expires_at IS 'Cache expiration timestamp (30 days from creation)';

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_geocoding_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_geocoding_cache_updated_at
    BEFORE UPDATE ON geocoding_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_geocoding_cache_updated_at();