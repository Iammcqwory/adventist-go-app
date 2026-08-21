CREATE TABLE hymns (
  id BIGSERIAL PRIMARY KEY,
  number INTEGER,
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  author TEXT,
  composer TEXT,
  copyright_info TEXT,
  category TEXT DEFAULT 'general',
  key_signature TEXT,
  time_signature TEXT,
  tempo TEXT,
  scripture_reference TEXT,
  themes JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hymns_number ON hymns(number);
CREATE INDEX idx_hymns_title ON hymns(title);
CREATE INDEX idx_hymns_category ON hymns(category);
CREATE INDEX idx_hymns_themes ON hymns USING GIN(themes);
