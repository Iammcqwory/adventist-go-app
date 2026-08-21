import { api, APIError } from "encore.dev/api";
import { sabbathDB } from "./db";

interface DeleteBibleBookmarkRequest {
  userId: string;
  bookmarkId: number;
}

// Deletes a Bible bookmark
export const deleteBibleBookmark = api<DeleteBibleBookmarkRequest, void>(
  { expose: true, method: "DELETE", path: "/bible/bookmarks/:bookmarkId" },
  async ({ userId, bookmarkId }) => {
    const result = await sabbathDB.exec`
      DELETE FROM bible_bookmarks 
      WHERE id = ${bookmarkId} AND user_id = ${userId}
    `;

    // Note: In a real implementation, you'd check the affected rows count
    // For now, we'll assume the deletion was successful
  }
);
