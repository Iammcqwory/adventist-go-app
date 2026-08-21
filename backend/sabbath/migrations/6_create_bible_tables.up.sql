CREATE TABLE bible_translations (
  id BIGSERIAL PRIMARY KEY,
  abbreviation TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  description TEXT,
  copyright_info TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bible_books (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('old', 'new')),
  book_order INTEGER NOT NULL,
  chapter_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bible_verses (
  id BIGSERIAL PRIMARY KEY,
  translation_id BIGINT NOT NULL REFERENCES bible_translations(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(translation_id, book_id, chapter, verse)
);

CREATE TABLE bible_cross_references (
  id BIGSERIAL PRIMARY KEY,
  from_book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  from_chapter INTEGER NOT NULL,
  from_verse INTEGER NOT NULL,
  to_book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  to_chapter INTEGER NOT NULL,
  to_verse INTEGER NOT NULL,
  reference_type TEXT DEFAULT 'related',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bible_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  note TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter, verse)
);

-- Indexes for performance
CREATE INDEX idx_bible_verses_translation_book ON bible_verses(translation_id, book_id);
CREATE INDEX idx_bible_verses_chapter_verse ON bible_verses(chapter, verse);
CREATE INDEX idx_bible_verses_text_search ON bible_verses USING GIN(to_tsvector('english', text));
CREATE INDEX idx_bible_cross_references_from ON bible_cross_references(from_book_id, from_chapter, from_verse);
CREATE INDEX idx_bible_cross_references_to ON bible_cross_references(to_book_id, to_chapter, to_verse);
CREATE INDEX idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX idx_bible_bookmarks_book_chapter ON bible_bookmarks(book_id, chapter);

-- Insert default Bible books
INSERT INTO bible_books (name, abbreviation, testament, book_order, chapter_count) VALUES
-- Old Testament
('Genesis', 'Gen', 'old', 1, 50),
('Exodus', 'Exod', 'old', 2, 40),
('Leviticus', 'Lev', 'old', 3, 27),
('Numbers', 'Num', 'old', 4, 36),
('Deuteronomy', 'Deut', 'old', 5, 34),
('Joshua', 'Josh', 'old', 6, 24),
('Judges', 'Judg', 'old', 7, 21),
('Ruth', 'Ruth', 'old', 8, 4),
('1 Samuel', '1Sam', 'old', 9, 31),
('2 Samuel', '2Sam', 'old', 10, 24),
('1 Kings', '1Kgs', 'old', 11, 22),
('2 Kings', '2Kgs', 'old', 12, 25),
('1 Chronicles', '1Chr', 'old', 13, 29),
('2 Chronicles', '2Chr', 'old', 14, 36),
('Ezra', 'Ezra', 'old', 15, 10),
('Nehemiah', 'Neh', 'old', 16, 13),
('Esther', 'Esth', 'old', 17, 10),
('Job', 'Job', 'old', 18, 42),
('Psalms', 'Ps', 'old', 19, 150),
('Proverbs', 'Prov', 'old', 20, 31),
('Ecclesiastes', 'Eccl', 'old', 21, 12),
('Song of Solomon', 'Song', 'old', 22, 8),
('Isaiah', 'Isa', 'old', 23, 66),
('Jeremiah', 'Jer', 'old', 24, 52),
('Lamentations', 'Lam', 'old', 25, 5),
('Ezekiel', 'Ezek', 'old', 26, 48),
('Daniel', 'Dan', 'old', 27, 12),
('Hosea', 'Hos', 'old', 28, 14),
('Joel', 'Joel', 'old', 29, 3),
('Amos', 'Amos', 'old', 30, 9),
('Obadiah', 'Obad', 'old', 31, 1),
('Jonah', 'Jonah', 'old', 32, 4),
('Micah', 'Mic', 'old', 33, 7),
('Nahum', 'Nah', 'old', 34, 3),
('Habakkuk', 'Hab', 'old', 35, 3),
('Zephaniah', 'Zeph', 'old', 36, 3),
('Haggai', 'Hag', 'old', 37, 2),
('Zechariah', 'Zech', 'old', 38, 14),
('Malachi', 'Mal', 'old', 39, 4),
-- New Testament
('Matthew', 'Matt', 'new', 40, 28),
('Mark', 'Mark', 'new', 41, 16),
('Luke', 'Luke', 'new', 42, 24),
('John', 'John', 'new', 43, 21),
('Acts', 'Acts', 'new', 44, 28),
('Romans', 'Rom', 'new', 45, 16),
('1 Corinthians', '1Cor', 'new', 46, 16),
('2 Corinthians', '2Cor', 'new', 47, 13),
('Galatians', 'Gal', 'new', 48, 6),
('Ephesians', 'Eph', 'new', 49, 6),
('Philippians', 'Phil', 'new', 50, 4),
('Colossians', 'Col', 'new', 51, 4),
('1 Thessalonians', '1Thess', 'new', 52, 5),
('2 Thessalonians', '2Thess', 'new', 53, 3),
('1 Timothy', '1Tim', 'new', 54, 6),
('2 Timothy', '2Tim', 'new', 55, 4),
('Titus', 'Titus', 'new', 56, 3),
('Philemon', 'Phlm', 'new', 57, 1),
('Hebrews', 'Heb', 'new', 58, 13),
('James', 'Jas', 'new', 59, 5),
('1 Peter', '1Pet', 'new', 60, 5),
('2 Peter', '2Pet', 'new', 61, 3),
('1 John', '1John', 'new', 62, 5),
('2 John', '2John', 'new', 63, 1),
('3 John', '3John', 'new', 64, 1),
('Jude', 'Jude', 'new', 65, 1),
('Revelation', 'Rev', 'new', 66, 22);

-- Insert default translation
INSERT INTO bible_translations (abbreviation, name, language, description, is_default) VALUES
('KJV', 'King James Version', 'en', 'The classic English translation of the Bible', true);
