import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetBibleCrossReferencesRequest {
  bookId: number;
  chapter: number;
  verse: number;
}

interface CrossReference {
  id: number;
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  verse: number;
  reference: string;
  referenceType: string;
}

interface GetBibleCrossReferencesResponse {
  crossReferences: CrossReference[];
}

// Retrieves cross-references for a specific Bible verse
export const getBibleCrossReferences = api<GetBibleCrossReferencesRequest, GetBibleCrossReferencesResponse>(
  { expose: true, method: "GET", path: "/bible/cross-references" },
  async ({ bookId, chapter, verse }) => {
    const query = `
      SELECT cr.id, b.name as book_name, b.abbreviation as book_abbreviation,
             cr.to_chapter as chapter, cr.to_verse as verse, cr.reference_type,
             CONCAT(b.name, ' ', cr.to_chapter, ':', cr.to_verse) as reference
      FROM bible_cross_references cr
      JOIN bible_books b ON cr.to_book_id = b.id
      WHERE cr.from_book_id = $1 AND cr.from_chapter = $2 AND cr.from_verse = $3
      ORDER BY b.book_order ASC, cr.to_chapter ASC, cr.to_verse ASC
    `;

    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      book_name: string;
      book_abbreviation: string;
      chapter: number;
      verse: number;
      reference_type: string;
      reference: string;
    }>(query, bookId, chapter, verse);

    const crossReferences = rows.map(row => ({
      id: row.id,
      bookName: row.book_name,
      bookAbbreviation: row.book_abbreviation,
      chapter: row.chapter,
      verse: row.verse,
      reference: row.reference,
      referenceType: row.reference_type,
    }));

    return { crossReferences };
  }
);
