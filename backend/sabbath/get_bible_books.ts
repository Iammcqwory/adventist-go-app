import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface BibleBook {
  id: number;
  name: string;
  abbreviation: string;
  testament: string;
  bookOrder: number;
  chapterCount: number;
}

interface GetBibleBooksResponse {
  books: BibleBook[];
}

// Retrieves all Bible books
export const getBibleBooks = api<void, GetBibleBooksResponse>(
  { expose: true, method: "GET", path: "/bible/books" },
  async () => {
    const rows = await sabbathDB.queryAll<{
      id: number;
      name: string;
      abbreviation: string;
      testament: string;
      book_order: number;
      chapter_count: number;
    }>`
      SELECT id, name, abbreviation, testament, book_order, chapter_count
      FROM bible_books
      ORDER BY book_order ASC
    `;

    const books = rows.map(row => ({
      id: row.id,
      name: row.name,
      abbreviation: row.abbreviation,
      testament: row.testament,
      bookOrder: row.book_order,
      chapterCount: row.chapter_count,
    }));

    return { books };
  }
);
