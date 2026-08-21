import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SaveBibleVerseNoteRequest {
  userId: string;
  bookId: number;
  chapter: number;
  verse: number;
  note?: string;
  isHighlighted?: boolean;
  highlightColor?: string;
}

interface VerseNote {
  id: number;
  userId: string;
  bookId: number;
  chapter: number;
  verse: number;
  note: string;
  isHighlighted: boolean;
  highlightColor: string | null;
  createdAt: string;
  updatedAt: string;
}

// Saves or updates a verse note/highlight
export const saveBibleVerseNote = api<SaveBibleVerseNoteRequest, VerseNote>(
  { expose: true, method: "POST", path: "/bible/verse-notes" },
  async ({ userId, bookId, chapter, verse, note, isHighlighted, highlightColor }) => {
    const existingRow = await sabbathDB.queryRow<{ id: number }>`
      SELECT id FROM bible_verse_notes 
      WHERE user_id = ${userId} AND book_id = ${bookId} AND chapter = ${chapter} AND verse = ${verse}
    `;

    let row;
    if (existingRow) {
      row = await sabbathDB.queryRow<{
        id: number;
        user_id: string;
        book_id: number;
        chapter: number;
        verse: number;
        note: string;
        is_highlighted: boolean;
        highlight_color: string | null;
        created_at: string;
        updated_at: string;
      }>`
        UPDATE bible_verse_notes
        SET note = COALESCE(${note || null}, note),
            is_highlighted = COALESCE(${isHighlighted}, is_highlighted),
            highlight_color = COALESCE(${highlightColor || null}, highlight_color),
            updated_at = NOW()
        WHERE user_id = ${userId} AND book_id = ${bookId} AND chapter = ${chapter} AND verse = ${verse}
        RETURNING id, user_id, book_id, chapter, verse, note, is_highlighted, highlight_color, created_at, updated_at
      `;
    } else {
      row = await sabbathDB.queryRow<{
        id: number;
        user_id: string;
        book_id: number;
        chapter: number;
        verse: number;
        note: string;
        is_highlighted: boolean;
        highlight_color: string | null;
        created_at: string;
        updated_at: string;
      }>`
        INSERT INTO bible_verse_notes (user_id, book_id, chapter, verse, note, is_highlighted, highlight_color)
        VALUES (${userId}, ${bookId}, ${chapter}, ${verse}, ${note || ''}, ${isHighlighted || false}, ${highlightColor || null})
        RETURNING id, user_id, book_id, chapter, verse, note, is_highlighted, highlight_color, created_at, updated_at
      `;
    }

    if (!row) {
      throw new Error("Failed to save verse note");
    }

    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      chapter: row.chapter,
      verse: row.verse,
      note: row.note,
      isHighlighted: row.is_highlighted,
      highlightColor: row.highlight_color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
