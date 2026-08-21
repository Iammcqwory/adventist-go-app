import { api } from "encore.dev/api";
import { feedDB } from "./db";

export interface LikeReelRequest {
  id: number;
}

export interface LikeReelResponse {
  id: number;
  likesCount: number;
  success: boolean;
}

// Atomically increments like counter for a reel
export const likeReel = api<LikeReelRequest, LikeReelResponse>(
  { expose: true, method: "POST", path: "/feed/reels/:id/like" },
  async ({ id }) => {
    const row = await feedDB.rawQueryRow<{ id: number; likes_count: number }>(
      `UPDATE reels 
       SET likes_count = likes_count + 1 
       WHERE id = $1 
       RETURNING id, likes_count`,
      id
    );

    if (!row) {
      return {
        id,
        likesCount: 0,
        success: false,
      };
    }

    return {
      id: row.id,
      likesCount: row.likes_count,
      success: true,
    };
  }
);
