import { api, APIError } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleChapterRequest {
  bookId: number;
  chapter: number;
  translationId?: number;
}

interface BibleVerse {
  id: number;
  verse: number;
  text: string;
}

interface GetBibleChapterResponse {
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  translationAbbreviation: string;
  verses: BibleVerse[];
}

// Retrieves all verses in a Bible chapter
export const getBibleChapter = api<GetBibleChapterRequest, GetBibleChapterResponse>(
  { expose: true, method: "GET", path: "/bible/chapter" },
  async ({ bookId, chapter, translationId }) => {
    let query = `
      SELECT v.id, v.verse, v.text, b.name as book_name, 
             b.abbreviation as book_abbreviation, t.abbreviation as translation_abbreviation
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      JOIN bible_translations t ON v.translation_id = t.id
      WHERE v.book_id = $1 AND v.chapter = $2
    `;

    const params: any[] = [bookId, chapter];

    if (translationId) {
      query += ` AND v.translation_id = $3`;
      params.push(translationId);
    } else {
      query += ` AND t.is_default = true`;
    }

    query += ` ORDER BY v.verse ASC`;

    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      verse: number;
      text: string;
      book_name: string;
      book_abbreviation: string;
      translation_abbreviation: string;
    }>(query, ...params);

    if (rows.length === 0) {
      throw APIError.notFound("chapter not found");
    }

    const firstRow = rows[0];
    const verses = rows.map(row => ({
      id: row.id,
      verse: row.verse,
      text: row.text,
    }));

    return {
      bookName: firstRow.book_name,
      bookAbbreviation: firstRow.book_abbreviation,
      chapter,
      translationAbbreviation: firstRow.translation_abbreviation,
      verses,
    };
  }
);
