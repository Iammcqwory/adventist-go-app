import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleBookmarksRequest {
  userId: string;
  tag?: string;
}

interface BibleBookmark {
  id: number;
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  verse: number;
  reference: string;
  note: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface GetBibleBookmarksResponse {
  bookmarks: BibleBookmark[];
}

// Retrieves Bible bookmarks for a user
export const getBibleBookmarks = api<GetBibleBookmarksRequest, GetBibleBookmarksResponse>(
  { expose: true, method: "GET", path: "/bible/bookmarks/:userId" },
  async ({ userId, tag }) => {
    let query = `
      SELECT bm.id, b.name as book_name, b.abbreviation as book_abbreviation,
             bm.chapter, bm.verse, bm.note, bm.tags, bm.created_at, bm.updated_at,
             CONCAT(b.name, ' ', bm.chapter, ':', bm.verse) as reference
      FROM bible_bookmarks bm
      JOIN bible_books b ON bm.book_id = b.id
      WHERE bm.user_id = $1
    `;

    const params: any[] = [userId];

    if (tag) {
      query += ` AND $2 = ANY(bm.tags)`;
      params.push(tag);
    }

    query += ` ORDER BY bm.created_at DESC`;

    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      book_name: string;
      book_abbreviation: string;
      chapter: number;
      verse: number;
      note: string | null;
      tags: string[];
      created_at: string;
      updated_at: string;
      reference: string;
    }>(query, ...params);

    const bookmarks = rows.map(row => ({
      id: row.id,
      bookName: row.book_name,
      bookAbbreviation: row.book_abbreviation,
      chapter: row.chapter,
      verse: row.verse,
      reference: row.reference,
      note: row.note,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { bookmarks };
  }
);
