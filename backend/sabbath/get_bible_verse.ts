import { api, APIError } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleVerseRequest {
  bookId: number;
  chapter: number;
  verse: number;
  translationId?: number;
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
}

// Retrieves a specific Bible verse
export const getBibleVerse = api<GetBibleVerseRequest, BibleVerse>(
  { expose: true, method: "GET", path: "/bible/verse" },
  async ({ bookId, chapter, verse, translationId }) => {
    let query = `
      SELECT v.id, v.translation_id, t.abbreviation as translation_abbreviation,
             v.book_id, b.name as book_name, b.abbreviation as book_abbreviation,
             v.chapter, v.verse, v.text,
             CONCAT(b.name, ' ', v.chapter, ':', v.verse) as reference
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      JOIN bible_translations t ON v.translation_id = t.id
      WHERE v.book_id = $1 AND v.chapter = $2 AND v.verse = $3
    `;

    const params: any[] = [bookId, chapter, verse];

    if (translationId) {
      query += ` AND v.translation_id = $4`;
      params.push(translationId);
    } else {
      query += ` AND t.is_default = true`;
    }

    const row = await sabbathDB.rawQueryRow<{
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
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("verse not found");
    }

    return {
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
    };
  }
);
