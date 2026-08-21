-- Add audio fields to hymns table
ALTER TABLE hymns ADD COLUMN audio_url TEXT;
ALTER TABLE hymns ADD COLUMN audio_duration INTEGER; -- duration in seconds

-- Add audio fields to devotionals table
ALTER TABLE devotionals ADD COLUMN audio_url TEXT;
ALTER TABLE devotionals ADD COLUMN audio_duration INTEGER; -- duration in seconds

-- Create index for audio-enabled content
CREATE INDEX idx_hymns_audio ON hymns(audio_url) WHERE audio_url IS NOT NULL;
CREATE INDEX idx_devotionals_audio ON devotionals(audio_url) WHERE audio_url IS NOT NULL;
