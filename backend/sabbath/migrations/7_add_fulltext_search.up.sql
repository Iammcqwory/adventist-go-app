-- Add full-text search capabilities to bible_verses table

-- Create a new column for the full-text search vector
ALTER TABLE bible_verses ADD COLUMN search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_bible_verse_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the search vector
CREATE TRIGGER bible_verse_search_vector_update
  BEFORE INSERT OR UPDATE ON bible_verses
  FOR EACH ROW
  EXECUTE FUNCTION update_bible_verse_search_vector();

-- Update existing rows with search vectors
UPDATE bible_verses SET search_vector = to_tsvector('english', COALESCE(text, ''));

-- Create GIN index for full-text search performance
CREATE INDEX idx_bible_verses_search_vector ON bible_verses USING GIN(search_vector);

-- Create additional indexes for better search performance
CREATE INDEX idx_bible_verses_text_gin ON bible_verses USING GIN(to_tsvector('english', text));

-- Create a function for advanced search with ranking
CREATE OR REPLACE FUNCTION search_bible_verses_ranked(
  search_query text,
  translation_id_param integer DEFAULT NULL,
  book_id_param integer DEFAULT NULL,
  testament_param text DEFAULT NULL,
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS TABLE(
  id bigint,
  translation_id bigint,
  translation_abbreviation text,
  book_id bigint,
  book_name text,
  book_abbreviation text,
  chapter integer,
  verse integer,
  text text,
  reference text,
  rank real,
  headline text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.translation_id,
    t.abbreviation as translation_abbreviation,
    v.book_id,
    b.name as book_name,
    b.abbreviation as book_abbreviation,
    v.chapter,
    v.verse,
    v.text,
    CONCAT(b.name, ' ', v.chapter, ':', v.verse) as reference,
    ts_rank(v.search_vector, plainto_tsquery('english', search_query)) as rank,
    ts_headline('english', v.text, plainto_tsquery('english', search_query), 
                'MaxWords=50, MinWords=20, ShortWord=3, HighlightAll=false, MaxFragments=1') as headline
  FROM bible_verses v
  JOIN bible_books b ON v.book_id = b.id
  JOIN bible_translations t ON v.translation_id = t.id
  WHERE 
    v.search_vector @@ plainto_tsquery('english', search_query)
    AND (translation_id_param IS NULL OR v.translation_id = translation_id_param)
    AND (book_id_param IS NULL OR v.book_id = book_id_param)
    AND (testament_param IS NULL OR b.testament = testament_param)
  ORDER BY 
    ts_rank(v.search_vector, plainto_tsquery('english', search_query)) DESC,
    b.book_order ASC,
    v.chapter ASC,
    v.verse ASC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function for phrase search
CREATE OR REPLACE FUNCTION search_bible_verses_phrase(
  search_phrase text,
  translation_id_param integer DEFAULT NULL,
  book_id_param integer DEFAULT NULL,
  testament_param text DEFAULT NULL,
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS TABLE(
  id bigint,
  translation_id bigint,
  translation_abbreviation text,
  book_id bigint,
  book_name text,
  book_abbreviation text,
  chapter integer,
  verse integer,
  text text,
  reference text,
  rank real,
  headline text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.translation_id,
    t.abbreviation as translation_abbreviation,
    v.book_id,
    b.name as book_name,
    b.abbreviation as book_abbreviation,
    v.chapter,
    v.verse,
    v.text,
    CONCAT(b.name, ' ', v.chapter, ':', v.verse) as reference,
    ts_rank(v.search_vector, phraseto_tsquery('english', search_phrase)) as rank,
    ts_headline('english', v.text, phraseto_tsquery('english', search_phrase), 
                'MaxWords=50, MinWords=20, ShortWord=3, HighlightAll=false, MaxFragments=1') as headline
  FROM bible_verses v
  JOIN bible_books b ON v.book_id = b.id
  JOIN bible_translations t ON v.translation_id = t.id
  WHERE 
    v.search_vector @@ phraseto_tsquery('english', search_phrase)
    AND (translation_id_param IS NULL OR v.translation_id = translation_id_param)
    AND (book_id_param IS NULL OR v.book_id = book_id_param)
    AND (testament_param IS NULL OR b.testament = testament_param)
  ORDER BY 
    ts_rank(v.search_vector, phraseto_tsquery('english', search_phrase)) DESC,
    b.book_order ASC,
    v.chapter ASC,
    v.verse ASC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function for topic-based search using synonyms and related terms
CREATE OR REPLACE FUNCTION search_bible_verses_topic(
  topic_terms text[],
  translation_id_param integer DEFAULT NULL,
  book_id_param integer DEFAULT NULL,
  testament_param text DEFAULT NULL,
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS TABLE(
  id bigint,
  translation_id bigint,
  translation_abbreviation text,
  book_id bigint,
  book_name text,
  book_abbreviation text,
  chapter integer,
  verse integer,
  text text,
  reference text,
  rank real,
  headline text
) AS $$
DECLARE
  search_query_text text;
BEGIN
  -- Build OR query from topic terms
  search_query_text := array_to_string(topic_terms, ' | ');
  
  RETURN QUERY
  SELECT 
    v.id,
    v.translation_id,
    t.abbreviation as translation_abbreviation,
    v.book_id,
    b.name as book_name,
    b.abbreviation as book_abbreviation,
    v.chapter,
    v.verse,
    v.text,
    CONCAT(b.name, ' ', v.chapter, ':', v.verse) as reference,
    ts_rank(v.search_vector, to_tsquery('english', search_query_text)) as rank,
    ts_headline('english', v.text, to_tsquery('english', search_query_text), 
                'MaxWords=50, MinWords=20, ShortWord=3, HighlightAll=false, MaxFragments=1') as headline
  FROM bible_verses v
  JOIN bible_books b ON v.book_id = b.id
  JOIN bible_translations t ON v.translation_id = t.id
  WHERE 
    v.search_vector @@ to_tsquery('english', search_query_text)
    AND (translation_id_param IS NULL OR v.translation_id = translation_id_param)
    AND (book_id_param IS NULL OR v.book_id = book_id_param)
    AND (testament_param IS NULL OR b.testament = testament_param)
  ORDER BY 
    ts_rank(v.search_vector, to_tsquery('english', search_query_text)) DESC,
    b.book_order ASC,
    v.chapter ASC,
    v.verse ASC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Create a table for search suggestions and popular terms
CREATE TABLE bible_search_suggestions (
  id BIGSERIAL PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for search suggestions
CREATE INDEX idx_bible_search_suggestions_term ON bible_search_suggestions(term);
CREATE INDEX idx_bible_search_suggestions_count ON bible_search_suggestions(search_count DESC);

-- Function to update search suggestions
CREATE OR REPLACE FUNCTION update_search_suggestion(search_term text)
RETURNS void AS $$
BEGIN
  INSERT INTO bible_search_suggestions (term, search_count, last_searched)
  VALUES (LOWER(TRIM(search_term)), 1, NOW())
  ON CONFLICT (term) 
  DO UPDATE SET 
    search_count = bible_search_suggestions.search_count + 1,
    last_searched = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some common search terms for suggestions
INSERT INTO bible_search_suggestions (term, search_count) VALUES
('love', 50),
('faith', 45),
('hope', 40),
('peace', 35),
('joy', 30),
('salvation', 25),
('grace', 20),
('forgiveness', 18),
('prayer', 15),
('wisdom', 12),
('strength', 10),
('comfort', 8),
('healing', 6),
('blessing', 5),
('eternal life', 4)
ON CONFLICT (term) DO NOTHING;
