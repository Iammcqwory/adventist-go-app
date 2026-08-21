import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SaveJournalRequest {
  userId: string;
  title?: string;
  content: string;
  entryDate: string;
  entryType?: string;
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

// Saves a journal entry for reflection
export const saveJournalEntry = api<SaveJournalRequest, JournalEntry>(
  { expose: true, method: "POST", path: "/journal" },
  async ({ userId, title, content, entryDate, entryType = "reflection" }) => {
    const row = await sabbathDB.queryRow<{
      id: number;
      user_id: string;
      title: string | null;
      content: string;
      entry_date: string;
      entry_type: string;
      created_at: string;
      updated_at: string;
    }>`
      INSERT INTO journal_entries (user_id, title, content, entry_date, entry_type, updated_at)
      VALUES (${userId}, ${title || null}, ${content}, ${entryDate}, ${entryType}, NOW())
      RETURNING id, user_id, title, content, entry_date, entry_type, created_at, updated_at
    `;
    
    if (!row) {
      throw new Error("Failed to save journal entry");
    }
    
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      entryDate: row.entry_date,
      entryType: row.entry_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
