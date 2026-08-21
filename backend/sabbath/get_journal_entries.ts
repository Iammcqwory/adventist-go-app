import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetJournalRequest {
  userId: string;
  startDate?: string;
  endDate?: string;
}

interface JournalEntry {
  id: number;
  userId: string;
  title: string | null;
  content: string;
  entryDate: string;
  entryType: string;
  createdAt: string;
  updatedAt: string;
}

interface GetJournalResponse {
  entries: JournalEntry[];
}

// Retrieves journal entries for a user
export const getJournalEntries = api<GetJournalRequest, GetJournalResponse>(
  { expose: true, method: "GET", path: "/journal/:userId" },
  async ({ userId, startDate, endDate }) => {
    let query = `
      SELECT id, user_id, title, content, entry_date, entry_type, created_at, updated_at
      FROM journal_entries
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    
    if (startDate) {
      query += ` AND entry_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND entry_date <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY entry_date DESC, created_at DESC`;
    
    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      user_id: string;
      title: string | null;
      content: string;
      entry_date: string;
      entry_type: string;
      created_at: string;
      updated_at: string;
    }>(query, ...params);
    
    const entries = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      entryDate: row.entry_date,
      entryType: row.entry_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    return { entries };
  }
);
