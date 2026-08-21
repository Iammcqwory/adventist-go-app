import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SearchBibleVersesRequest {
  query: string;
  translationId?: number;
  bookId?: number;
  testament?: string;
  searchType?: 'keyword' | 'phrase' | 'topic';
  limit?: number;
  offset?: number;
}

interface BibleVerse {
  id: number;
  translationId: number;
  translationAbbreviation: string;
  bookId: number;
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  rank?: number;
  headline?: string;
}

interface SearchBibleVersesResponse {
  verses: BibleVerse[];
  total: number;
  searchType: string;
  suggestions?: string[];
}

// Searches Bible verses by text content using PostgreSQL full-text search
export const searchBibleVerses = api<SearchBibleVersesRequest, SearchBibleVersesResponse>(
  { expose: true, method: "GET", path: "/bible/search" },
  async ({ query, translationId, bookId, testament, searchType = 'keyword', limit = 50, offset = 0 }) => {
    if (!query || query.trim().length === 0) {
      return {
        verses: [],
        total: 0,
        searchType,
        suggestions: await getSearchSuggestions(),
      };
    }

    const trimmedQuery = query.trim();
    
    // Update search suggestions asynchronously
    updateSearchSuggestion(trimmedQuery);

    let verses: BibleVerse[] = [];
    let total = 0;

    try {
      if (searchType === 'phrase') {
        // Use phrase search for exact phrase matching
        const results = await searchByPhrase(trimmedQuery, translationId, bookId, testament, limit, offset);
        verses = results.verses;
        total = results.total;
      } else if (searchType === 'topic') {
        // Use topic search with expanded terms
        const topicTerms = expandTopicTerms(trimmedQuery);
        const results = await searchByTopic(topicTerms, translationId, bookId, testament, limit, offset);
        verses = results.verses;
        total = results.total;
      } else {
        // Default keyword search with ranking
        const results = await searchByKeywords(trimmedQuery, translationId, bookId, testament, limit, offset);
        verses = results.verses;
        total = results.total;
      }

      return {
        verses,
        total,
        searchType,
        suggestions: verses.length === 0 ? await getSearchSuggestions(trimmedQuery) : undefined,
      };
    } catch (error) {
      console.error('Full-text search error:', error);
      
      // Fallback to basic ILIKE search if full-text search fails
      const fallbackResults = await fallbackSearch(trimmedQuery, translationId, bookId, testament, limit, offset);
      
      return {
        verses: fallbackResults.verses,
        total: fallbackResults.total,
        searchType: 'fallback',
        suggestions: await getSearchSuggestions(trimmedQuery),
      };
    }
  }
);

async function searchByKeywords(
  query: string, 
  translationId?: number, 
  bookId?: number, 
  testament?: string, 
  limit = 50, 
  offset = 0
) {
  const rows = await sabbathDB.rawQueryAll<{
    id: number;
    translation_id: number;
    translation_abbreviation: string;
    book_id: number;
    book_name: string;
    book_abbreviation: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
    rank: number;
    headline: string;
  }>(`
    SELECT * FROM search_bible_verses_ranked($1, $2, $3, $4, $5, $6)
  `, query, translationId || null, bookId || null, testament || null, limit, offset);

  // Get total count for pagination
  const countResult = await sabbathDB.rawQueryRow<{ total: number }>(`
    SELECT COUNT(*) as total
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    JOIN bible_translations t ON v.translation_id = t.id
    WHERE 
      v.search_vector @@ plainto_tsquery('english', $1)
      AND ($2::integer IS NULL OR v.translation_id = $2)
      AND ($3::integer IS NULL OR v.book_id = $3)
      AND ($4::text IS NULL OR b.testament = $4)
  `, query, translationId || null, bookId || null, testament || null);

  const verses = rows.map(row => ({
    id: row.id,
    translationId: row.translation_id,
    translationAbbreviation: row.translation_abbreviation,
    bookId: row.book_id,
    bookName: row.book_name,
    bookAbbreviation: row.book_abbreviation,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
    reference: row.reference,
    rank: row.rank,
    headline: row.headline,
  }));

  return {
    verses,
    total: countResult?.total || 0,
  };
}

async function searchByPhrase(
  phrase: string, 
  translationId?: number, 
  bookId?: number, 
  testament?: string, 
  limit = 50, 
  offset = 0
) {
  const rows = await sabbathDB.rawQueryAll<{
    id: number;
    translation_id: number;
    translation_abbreviation: string;
    book_id: number;
    book_name: string;
    book_abbreviation: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
    rank: number;
    headline: string;
  }>(`
    SELECT * FROM search_bible_verses_phrase($1, $2, $3, $4, $5, $6)
  `, phrase, translationId || null, bookId || null, testament || null, limit, offset);

  // Get total count for pagination
  const countResult = await sabbathDB.rawQueryRow<{ total: number }>(`
    SELECT COUNT(*) as total
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    JOIN bible_translations t ON v.translation_id = t.id
    WHERE 
      v.search_vector @@ phraseto_tsquery('english', $1)
      AND ($2::integer IS NULL OR v.translation_id = $2)
      AND ($3::integer IS NULL OR v.book_id = $3)
      AND ($4::text IS NULL OR b.testament = $4)
  `, phrase, translationId || null, bookId || null, testament || null);

  const verses = rows.map(row => ({
    id: row.id,
    translationId: row.translation_id,
    translationAbbreviation: row.translation_abbreviation,
    bookId: row.book_id,
    bookName: row.book_name,
    bookAbbreviation: row.book_abbreviation,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
    reference: row.reference,
    rank: row.rank,
    headline: row.headline,
  }));

  return {
    verses,
    total: countResult?.total || 0,
  };
}

async function searchByTopic(
  topicTerms: string[], 
  translationId?: number, 
  bookId?: number, 
  testament?: string, 
  limit = 50, 
  offset = 0
) {
  const rows = await sabbathDB.rawQueryAll<{
    id: number;
    translation_id: number;
    translation_abbreviation: string;
    book_id: number;
    book_name: string;
    book_abbreviation: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
    rank: number;
    headline: string;
  }>(`
    SELECT * FROM search_bible_verses_topic($1, $2, $3, $4, $5, $6)
  `, topicTerms, translationId || null, bookId || null, testament || null, limit, offset);

  // Build OR query for count
  const searchQueryText = topicTerms.join(' | ');
  const countResult = await sabbathDB.rawQueryRow<{ total: number }>(`
    SELECT COUNT(*) as total
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    JOIN bible_translations t ON v.translation_id = t.id
    WHERE 
      v.search_vector @@ to_tsquery('english', $1)
      AND ($2::integer IS NULL OR v.translation_id = $2)
      AND ($3::integer IS NULL OR v.book_id = $3)
      AND ($4::text IS NULL OR b.testament = $4)
  `, searchQueryText, translationId || null, bookId || null, testament || null);

  const verses = rows.map(row => ({
    id: row.id,
    translationId: row.translation_id,
    translationAbbreviation: row.translation_abbreviation,
    bookId: row.book_id,
    bookName: row.book_name,
    bookAbbreviation: row.book_abbreviation,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
    reference: row.reference,
    rank: row.rank,
    headline: row.headline,
  }));

  return {
    verses,
    total: countResult?.total || 0,
  };
}

async function fallbackSearch(
  query: string, 
  translationId?: number, 
  bookId?: number, 
  testament?: string, 
  limit = 50, 
  offset = 0
) {
  let whereConditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Add text search condition using ILIKE
  whereConditions.push(`v.text ILIKE $${paramIndex}`);
  params.push(`%${query}%`);
  paramIndex++;

  // Add translation filter
  if (translationId) {
    whereConditions.push(`v.translation_id = $${paramIndex}`);
    params.push(translationId);
    paramIndex++;
  }

  // Add book filter
  if (bookId) {
    whereConditions.push(`v.book_id = $${paramIndex}`);
    params.push(bookId);
    paramIndex++;
  }

  // Add testament filter
  if (testament) {
    whereConditions.push(`b.testament = $${paramIndex}`);
    params.push(testament);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    JOIN bible_translations t ON v.translation_id = t.id
    ${whereClause}
  `;
  const countResult = await sabbathDB.rawQueryRow<{ total: number }>(countQuery, ...params);

  // Get verses with pagination
  const versesQuery = `
    SELECT v.id, v.translation_id, t.abbreviation as translation_abbreviation,
           v.book_id, b.name as book_name, b.abbreviation as book_abbreviation,
           v.chapter, v.verse, v.text,
           CONCAT(b.name, ' ', v.chapter, ':', v.verse) as reference
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    JOIN bible_translations t ON v.translation_id = t.id
    ${whereClause}
    ORDER BY b.book_order ASC, v.chapter ASC, v.verse ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const rows = await sabbathDB.rawQueryAll<{
    id: number;
    translation_id: number;
    translation_abbreviation: string;
    book_id: number;
    book_name: string;
    book_abbreviation: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
  }>(versesQuery, ...params, limit, offset);

  const verses = rows.map(row => ({
    id: row.id,
    translationId: row.translation_id,
    translationAbbreviation: row.translation_abbreviation,
    bookId: row.book_id,
    bookName: row.book_name,
    bookAbbreviation: row.book_abbreviation,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
    reference: row.reference,
  }));

  return {
    verses,
    total: countResult?.total || 0,
  };
}

function expandTopicTerms(topic: string): string[] {
  const topicMap: Record<string, string[]> = {
    'love': ['love', 'beloved', 'charity', 'affection', 'compassion'],
    'faith': ['faith', 'believe', 'trust', 'confidence', 'faithful'],
    'hope': ['hope', 'expectation', 'anticipation', 'confidence', 'trust'],
    'peace': ['peace', 'peaceful', 'tranquil', 'calm', 'rest'],
    'joy': ['joy', 'joyful', 'rejoice', 'glad', 'happiness', 'delight'],
    'salvation': ['salvation', 'save', 'saved', 'savior', 'redeem', 'redemption'],
    'grace': ['grace', 'gracious', 'mercy', 'favor', 'kindness'],
    'forgiveness': ['forgive', 'forgiveness', 'pardon', 'mercy', 'remission'],
    'prayer': ['prayer', 'pray', 'petition', 'supplication', 'intercession'],
    'wisdom': ['wisdom', 'wise', 'understanding', 'knowledge', 'discernment'],
    'strength': ['strength', 'strong', 'power', 'might', 'courage'],
    'comfort': ['comfort', 'console', 'encourage', 'solace', 'peace'],
    'healing': ['heal', 'healing', 'cure', 'restore', 'recovery'],
    'blessing': ['blessing', 'blessed', 'favor', 'prosperity', 'abundance'],
    'eternal': ['eternal', 'everlasting', 'forever', 'immortal', 'endless'],
    'righteousness': ['righteous', 'righteousness', 'just', 'justice', 'holy'],
    'sin': ['sin', 'transgression', 'iniquity', 'wickedness', 'evil'],
    'repentance': ['repent', 'repentance', 'turn', 'convert', 'change'],
    'worship': ['worship', 'praise', 'adore', 'glorify', 'honor'],
    'obedience': ['obey', 'obedience', 'submit', 'follow', 'keep'],
  };

  const lowerTopic = topic.toLowerCase();
  
  // Check if the topic has predefined expansions
  if (topicMap[lowerTopic]) {
    return topicMap[lowerTopic];
  }

  // Check if any key contains the topic or vice versa
  for (const [key, terms] of Object.entries(topicMap)) {
    if (key.includes(lowerTopic) || lowerTopic.includes(key)) {
      return terms;
    }
  }

  // If no expansion found, return the original topic split by spaces
  return topic.toLowerCase().split(/\s+/).filter(term => term.length > 2);
}

async function updateSearchSuggestion(searchTerm: string) {
  try {
    await sabbathDB.rawExec(`SELECT update_search_suggestion($1)`, searchTerm);
  } catch (error) {
    console.error('Error updating search suggestion:', error);
  }
}

async function getSearchSuggestions(currentQuery?: string): Promise<string[]> {
  try {
    let query = `
      SELECT term 
      FROM bible_search_suggestions 
      ORDER BY search_count DESC, last_searched DESC 
      LIMIT 10
    `;
    let params: any[] = [];

    if (currentQuery && currentQuery.length > 2) {
      query = `
        SELECT term 
        FROM bible_search_suggestions 
        WHERE term ILIKE $1
        ORDER BY search_count DESC, last_searched DESC 
        LIMIT 10
      `;
      params = [`%${currentQuery.toLowerCase()}%`];
    }

    const rows = await sabbathDB.rawQueryAll<{ term: string }>(query, ...params);
    return rows.map(row => row.term);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
