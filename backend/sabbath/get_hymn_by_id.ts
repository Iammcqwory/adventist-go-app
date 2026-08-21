import { api, APIError } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetHymnByIdRequest {
  id: number;
}

interface Hymn {
  id: number;
  number: number | null;
  title: string;
  lyrics: string;
  author: string | null;
  composer: string | null;
  copyrightInfo: string | null;
  category: string;
  keySignature: string | null;
  timeSignature: string | null;
  tempo: string | null;
  scriptureReference: string | null;
  themes: string[];
}

// Retrieves a specific hymn by ID
export const getHymnById = api<GetHymnByIdRequest, Hymn>(
  { expose: true, method: "GET", path: "/hymns/:id" },
  async ({ id }) => {
    const row = await sabbathDB.queryRow<{
      id: number;
      number: number | null;
      title: string;
      lyrics: string;
      author: string | null;
      composer: string | null;
      copyright_info: string | null;
      category: string;
      key_signature: string | null;
      time_signature: string | null;
      tempo: string | null;
      scripture_reference: string | null;
      themes: string[];
    }>`
      SELECT id, number, title, lyrics, author, composer, copyright_info, category,
             key_signature, time_signature, tempo, scripture_reference, themes
      FROM hymns
      WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("hymn not found");
    }

    return {
      id: row.id,
      number: row.number,
      title: row.title,
      lyrics: row.lyrics,
      author: row.author,
      composer: row.composer,
      copyrightInfo: row.copyright_info,
      category: row.category,
      keySignature: row.key_signature,
      timeSignature: row.time_signature,
      tempo: row.tempo,
      scriptureReference: row.scripture_reference,
      themes: row.themes || [],
    };
  }
);
