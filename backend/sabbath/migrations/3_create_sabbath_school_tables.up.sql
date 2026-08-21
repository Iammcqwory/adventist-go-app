CREATE TABLE sabbath_school_quarters (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image_url TEXT,
  description TEXT,
  author TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sabbath_school_lessons (
  id BIGSERIAL PRIMARY KEY,
  quarter_id BIGINT NOT NULL REFERENCES sabbath_school_quarters(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  date_for DATE NOT NULL,
  memory_verse TEXT,
  introduction TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sabbath_school_daily_studies (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES sabbath_school_lessons(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  title TEXT NOT NULL,
  scripture_references TEXT[],
  content TEXT NOT NULL,
  discussion_questions TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sabbath_school_quarters_year_quarter ON sabbath_school_quarters(year, quarter);
CREATE INDEX idx_sabbath_school_lessons_quarter_id ON sabbath_school_lessons(quarter_id);
CREATE INDEX idx_sabbath_school_lessons_date ON sabbath_school_lessons(date_for);
CREATE INDEX idx_sabbath_school_daily_studies_lesson_id ON sabbath_school_daily_studies(lesson_id);
