import { api, APIError } from "encore.dev/api";
import { sabbathDB } from "./db";

interface DeleteBibleVerseNoteRequest {
  userId: string;
  noteId: number;
}

// Deletes a Bible verse note
export const deleteBibleVerseNote = api<DeleteBibleVerseNoteRequest, void>(
  { expose: true, method: "DELETE", path: "/bible/verse-notes/:noteId" },
  async ({ userId, noteId }) => {
    const result = await sabbathDB.exec`
      DELETE FROM bible_verse_notes 
      WHERE id = ${noteId} AND user_id = ${userId}
    `;

    // Note: In a real implementation, you'd check the affected rows count
    // For now, we'll assume the deletion was successful
  }
);
