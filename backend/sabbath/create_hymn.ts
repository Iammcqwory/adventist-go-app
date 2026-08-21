import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface CreateHymnRequest {
  number?: number;
  title: string;
  lyrics: string;
  author?: string;
  composer?: string;
  copyrightInfo?: string;
  category?: string;
  keySignature?: string;
  timeSignature?: string;
  tempo?: string;
  scriptureReference?: string;
  themes?: string[];
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

// Creates a new hymn
export const createHymn = api<CreateHymnRequest, Hymn>(
  { expose: true, method: "POST", path: "/hymns" },
  async ({ 
    number, 
    title, 
    lyrics, 
    author, 
    composer, 
    copyrightInfo, 
    category = "general", 
    keySignature, 
    timeSignature, 
    tempo, 
    scriptureReference, 
    themes = [] 
  }) => {
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
      INSERT INTO hymns (
        number, title, lyrics, author, composer, copyright_info, category,
        key_signature, time_signature, tempo, scripture_reference, themes
      )
      VALUES (
        ${number || null}, ${title}, ${lyrics}, ${author || null}, ${composer || null}, 
        ${copyrightInfo || null}, ${category}, ${keySignature || null}, 
        ${timeSignature || null}, ${tempo || null}, ${scriptureReference || null}, 
        ${JSON.stringify(themes)}
      )
      RETURNING id, number, title, lyrics, author, composer, copyright_info, category,
                key_signature, time_signature, tempo, scripture_reference, themes
    `;

    if (!row) {
      throw new Error("Failed to create hymn");
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
