-- Create table for user verse notes and highlights
CREATE TABLE bible_verse_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  note TEXT DEFAULT '',
  is_highlighted BOOLEAN DEFAULT false,
  highlight_color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter, verse)
);

-- Create table for Bible commentary
CREATE TABLE bible_commentary (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse INTEGER, -- NULL for chapter-level commentary
  commentary_type TEXT NOT NULL DEFAULT 'general', -- general, devotional, historical, theological
  author TEXT,
  title TEXT,
  content TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bible_verse_notes_user_book ON bible_verse_notes(user_id, book_id);
CREATE INDEX idx_bible_verse_notes_chapter_verse ON bible_verse_notes(book_id, chapter, verse);
CREATE INDEX idx_bible_verse_notes_highlighted ON bible_verse_notes(user_id, is_highlighted) WHERE is_highlighted = true;
CREATE INDEX idx_bible_commentary_book_chapter ON bible_commentary(book_id, chapter);
CREATE INDEX idx_bible_commentary_verse ON bible_commentary(book_id, chapter, verse);
CREATE INDEX idx_bible_commentary_type ON bible_commentary(commentary_type);

-- Insert some sample commentary entries
INSERT INTO bible_commentary (book_id, chapter, verse, commentary_type, author, title, content, source) VALUES
-- Genesis 1 commentary
(1, 1, NULL, 'general', 'Ellen G. White', 'The Creation Story', 'The story of creation is one of the most sublime themes presented to the human mind. The divine record declares that in the beginning God created the heaven and the earth. This simple statement contains profound truths about the nature of God and His relationship to the universe.', 'Patriarchs and Prophets'),
(1, 1, 1, 'devotional', 'Various', 'In the Beginning', 'The opening words of Scripture reveal God as the eternal, self-existent One who speaks worlds into existence. This verse establishes the foundation for all biblical truth - that God is the Creator and source of all life.', 'SDA Bible Commentary'),
(1, 1, 3, 'theological', 'Various', 'Let There Be Light', 'The first creative act recorded is the creation of light. This light was not the sun, which was created on the fourth day, but the fundamental energy that would make all life possible. It represents God''s first gift to His creation.', 'SDA Bible Commentary'),

-- John 3:16 commentary
(43, 3, 16, 'devotional', 'Ellen G. White', 'God''s Love Revealed', 'In this verse we see the heart of the gospel - God''s infinite love for humanity. The word "so" indicates the measure of God''s love - it is beyond human comprehension. This love moved Him to give His most precious gift.', 'The Desire of Ages'),
(43, 3, 16, 'theological', 'Various', 'The Gospel in Miniature', 'This verse has been called the gospel in miniature because it contains the essential elements of salvation: God''s love, Christ''s sacrifice, faith as the means of appropriation, and eternal life as the result.', 'SDA Bible Commentary'),

-- Psalm 23 commentary
(19, 23, NULL, 'general', 'Various', 'The Shepherd Psalm', 'Psalm 23 is perhaps the most beloved chapter in the Bible. It presents God as our caring Shepherd who provides, protects, and guides His people through all of life''s experiences, even through the valley of death.', 'SDA Bible Commentary'),
(19, 23, 1, 'devotional', 'Ellen G. White', 'The Lord is My Shepherd', 'When we can say with David, "The Lord is my shepherd," we acknowledge our complete dependence upon God and our confidence in His care. This personal relationship is the foundation of all spiritual peace and security.', 'Thoughts from the Mount of Blessing'),

-- Exodus 20:8-11 (Sabbath commandment)
(2, 20, 8, 'theological', 'Various', 'Remember the Sabbath', 'The Sabbath commandment begins with "Remember," indicating that the Sabbath was already in existence. It points back to creation week when God rested and sanctified the seventh day.', 'SDA Bible Commentary'),
(2, 20, 11, 'devotional', 'Ellen G. White', 'God''s Rest', 'God did not rest because He was weary, but to provide an example for humanity. The Sabbath is God''s gift to mankind - a day of rest, worship, and communion with the Creator.', 'Patriarchs and Prophets'),

-- Matthew 28:19-20 (Great Commission)
(40, 28, 19, 'general', 'Various', 'The Great Commission', 'Christ''s final command to His disciples was to make disciples of all nations. This commission extends to every follower of Christ throughout history and emphasizes the global scope of the gospel message.', 'SDA Bible Commentary'),
(40, 28, 20, 'devotional', 'Ellen G. White', 'Christ''s Presence', 'The promise "I am with you always" is one of the most comforting assurances in Scripture. Christ''s presence with His people is not limited by time or space - He is with us in every circumstance of life.', 'The Desire of Ages');
