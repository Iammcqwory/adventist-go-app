import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleVerseNotesRequest {
  userId: string;
  bookId?: number;
  chapter?: number;
  verse?: number;
}

interface VerseNote {
  id: number;
  userId: string;
  bookId: number;
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  verse: number;
  reference: string;
  note: string;
  isHighlighted: boolean;
  highlightColor: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetBibleVerseNotesResponse {
  notes: VerseNote[];
}

// Retrieves verse notes for a user, optionally filtered by book/chapter/verse
export const getBibleVerseNotes = api<GetBibleVerseNotesRequest, GetBibleVerseNotesResponse>(
  { expose: true, method: "GET", path: "/bible/verse-notes" },
  async ({ userId, bookId, chapter, verse }) => {
    let query = `
      SELECT vn.id, vn.user_id, vn.book_id, b.name as book_name, b.abbreviation as book_abbreviation,
             vn.chapter, vn.verse, vn.note, vn.is_highlighted, vn.highlight_color,
             vn.created_at, vn.updated_at,
             CONCAT(b.name, ' ', vn.chapter, ':', vn.verse) as reference
      FROM bible_verse_notes vn
      JOIN bible_books b ON vn.book_id = b.id
      WHERE vn.user_id = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (bookId) {
      query += ` AND vn.book_id = $${paramIndex}`;
      params.push(bookId);
      paramIndex++;
    }

    if (chapter) {
      query += ` AND vn.chapter = $${paramIndex}`;
      params.push(chapter);
      paramIndex++;
    }

    if (verse) {
      query += ` AND vn.verse = $${paramIndex}`;
      params.push(verse);
      paramIndex++;
    }

    query += ` ORDER BY b.book_order ASC, vn.chapter ASC, vn.verse ASC`;

    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      user_id: string;
      book_id: number;
      book_name: string;
      book_abbreviation: string;
      chapter: number;
      verse: number;
      note: string;
      is_highlighted: boolean;
      highlight_color: string | null;
      created_at: string;
      updated_at: string;
      reference: string;
    }>(query, ...params);

    const notes = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      bookName: row.book_name,
      bookAbbreviation: row.book_abbreviation,
      chapter: row.chapter,
      verse: row.verse,
      reference: row.reference,
      note: row.note,
      isHighlighted: row.is_highlighted,
      highlightColor: row.highlight_color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { notes };
  }
);
