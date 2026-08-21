import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetHymnsRequest {
  category?: string;
  search?: string;
  theme?: string;
  limit?: number;
  offset?: number;
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

interface GetHymnsResponse {
  hymns: Hymn[];
  total: number;
}

// Retrieves hymns with optional filtering and search
export const getHymns = api<GetHymnsRequest, GetHymnsResponse>(
  { expose: true, method: "GET", path: "/hymns" },
  async ({ category, search, theme, limit = 50, offset = 0 }) => {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR lyrics ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (theme) {
      whereConditions.push(`themes ? $${paramIndex}`);
      params.push(theme);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM hymns ${whereClause}`;
    const countResult = await sabbathDB.rawQueryRow<{ total: number }>(countQuery, ...params);
    const total = countResult?.total || 0;

    // Get hymns with pagination
    const query = `
      SELECT id, number, title, lyrics, author, composer, copyright_info, category, 
             key_signature, time_signature, tempo, scripture_reference, themes
      FROM hymns 
      ${whereClause}
      ORDER BY number ASC, title ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const rows = await sabbathDB.rawQueryAll<{
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
    }>(query, ...params, limit, offset);

    const hymns = rows.map(row => ({
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
    }));

    return { hymns, total };
  }
);
