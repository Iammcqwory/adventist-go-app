import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleCommentaryRequest {
  bookId: number;
  chapter: number;
  verse?: number;
}

interface CommentaryEntry {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number | null;
  reference: string;
  commentaryType: string;
  author: string | null;
  title: string | null;
  content: string;
  source: string | null;
}

interface GetBibleCommentaryResponse {
  commentary: CommentaryEntry[];
}

// Retrieves commentary for a specific Bible chapter or verse
export const getBibleCommentary = api<GetBibleCommentaryRequest, GetBibleCommentaryResponse>(
  { expose: true, method: "GET", path: "/bible/commentary" },
  async ({ bookId, chapter, verse }) => {
    let query = `
      SELECT c.id, c.book_id, b.name as book_name, c.chapter, c.verse,
             c.commentary_type, c.author, c.title, c.content, c.source,
             CASE 
               WHEN c.verse IS NOT NULL THEN CONCAT(b.name, ' ', c.chapter, ':', c.verse)
               ELSE CONCAT(b.name, ' ', c.chapter)
             END as reference
      FROM bible_commentary c
      JOIN bible_books b ON c.book_id = b.id
      WHERE c.book_id = $1 AND c.chapter = $2
    `;

    const params: any[] = [bookId, chapter];

    if (verse) {
      query += ` AND (c.verse = $3 OR c.verse IS NULL)`;
      params.push(verse);
    }

    query += ` ORDER BY c.verse ASC NULLS FIRST, c.commentary_type ASC`;

    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      book_id: number;
      book_name: string;
      chapter: number;
      verse: number | null;
      commentary_type: string;
      author: string | null;
      title: string | null;
      content: string;
      source: string | null;
      reference: string;
    }>(query, ...params);

    const commentary = rows.map(row => ({
      id: row.id,
      bookId: row.book_id,
      bookName: row.book_name,
      chapter: row.chapter,
      verse: row.verse,
      reference: row.reference,
      commentaryType: row.commentary_type,
      author: row.author,
      title: row.title,
      content: row.content,
      source: row.source,
    }));

    return { commentary };
  }
);
