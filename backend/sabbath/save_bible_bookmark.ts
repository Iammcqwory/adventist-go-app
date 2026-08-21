import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SaveBibleBookmarkRequest {
  userId: string;
  bookId: number;
  chapter: number;
  verse: number;
  note?: string;
  tags?: string[];
}

interface BibleBookmark {
  id: number;
  userId: string;
  bookId: number;
  chapter: number;
  verse: number;
  note: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Saves or updates a Bible bookmark
export const saveBibleBookmark = api<SaveBibleBookmarkRequest, BibleBookmark>(
  { expose: true, method: "POST", path: "/bible/bookmarks" },
  async ({ userId, bookId, chapter, verse, note, tags = [] }) => {
    const existingRow = await sabbathDB.queryRow<{ id: number }>`
      SELECT id FROM bible_bookmarks 
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
        note: string | null;
        tags: string[];
        created_at: string;
        updated_at: string;
      }>`
        UPDATE bible_bookmarks
        SET note = ${note || null},
            tags = ${JSON.stringify(tags)},
            updated_at = NOW()
        WHERE user_id = ${userId} AND book_id = ${bookId} AND chapter = ${chapter} AND verse = ${verse}
        RETURNING id, user_id, book_id, chapter, verse, note, tags, created_at, updated_at
      `;
    } else {
      row = await sabbathDB.queryRow<{
        id: number;
        user_id: string;
        book_id: number;
        chapter: number;
        verse: number;
        note: string | null;
        tags: string[];
        created_at: string;
        updated_at: string;
      }>`
        INSERT INTO bible_bookmarks (user_id, book_id, chapter, verse, note, tags)
        VALUES (${userId}, ${bookId}, ${chapter}, ${verse}, ${note || null}, ${JSON.stringify(tags)})
        RETURNING id, user_id, book_id, chapter, verse, note, tags, created_at, updated_at
      `;
    }

    if (!row) {
      throw new Error("Failed to save bookmark");
    }

    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      chapter: row.chapter,
      verse: row.verse,
      note: row.note,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
