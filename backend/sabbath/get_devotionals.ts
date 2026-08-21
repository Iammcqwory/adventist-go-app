import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface DevotionalsRequest {
  date?: string;
  category?: string;
}

interface Devotional {
  id: number;
  title: string;
  content: string;
  scriptureReference: string | null;
  author: string | null;
  dateFor: string | null;
  category: string;
}

interface DevotionalsResponse {
  devotionals: Devotional[];
}

// Retrieves devotionals for offline use
export const getDevotionals = api<DevotionalsRequest, DevotionalsResponse>(
  { expose: true, method: "GET", path: "/devotionals" },
  async ({ date, category }) => {
    let query = `SELECT id, title, content, scripture_reference, author, date_for, category FROM devotionals WHERE 1=1`;
    const params: any[] = [];
    
    if (date) {
      query += ` AND date_for = $${params.length + 1}`;
      params.push(date);
    }
    
    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    query += ` ORDER BY date_for DESC, created_at DESC`;
    
    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      title: string;
      content: string;
      scripture_reference: string | null;
      author: string | null;
      date_for: string | null;
      category: string;
    }>(query, ...params);
    
    const devotionals = rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      scriptureReference: row.scripture_reference,
      author: row.author,
      dateFor: row.date_for,
      category: row.category,
    }));
    
    return { devotionals };
  }
);
