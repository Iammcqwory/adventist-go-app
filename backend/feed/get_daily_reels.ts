import { api } from "encore.dev/api";
import { feedDB } from "./db";

export interface Reel {
  id: number;
  title: string;
  description: string | null;
  pillar: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  telegramCtaUrl: string;
  likesCount: number;
  sharesCount: number;
  isFeatured: boolean;
  publishedAt: string;
}

export interface GetDailyReelsRequest {
  pillar?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetDailyReelsResponse {
  reels: Reel[];
  total: number;
}

// Retrieves daily reels feed with optional pillar filter and pagination
export const getDailyReels = api<GetDailyReelsRequest, GetDailyReelsResponse>(
  { expose: true, method: "GET", path: "/feed/reels" },
  async ({ pillar, featuredOnly, limit = 20, offset = 0 }) => {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (pillar && pillar !== "all") {
      whereConditions.push(`pillar = $${paramIndex}`);
      params.push(pillar.toLowerCase());
      paramIndex++;
    }

    if (featuredOnly) {
      whereConditions.push(`is_featured = true`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as total FROM reels ${whereClause}`;
    const countResult = await feedDB.rawQueryRow<{ total: number }>(countQuery, ...params);
    const total = countResult?.total || 0;

    const query = `
      SELECT id, title, description, pillar, video_url, thumbnail_url,
             duration_seconds, telegram_cta_url, likes_count, shares_count,
             is_featured, published_at
      FROM reels
      ${whereClause}
      ORDER BY is_featured DESC, published_at DESC, id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const rows = await feedDB.rawQueryAll<{
      id: number;
      title: string;
      description: string | null;
      pillar: string;
      video_url: string;
      thumbnail_url: string | null;
      duration_seconds: number;
      telegram_cta_url: string;
      likes_count: number;
      shares_count: number;
      is_featured: boolean;
      published_at: Date;
    }>(query, ...params, limit, offset);

    const reels: Reel[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      pillar: row.pillar,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      durationSeconds: row.duration_seconds,
      telegramCtaUrl: row.telegram_cta_url,
      likesCount: row.likes_count,
      sharesCount: row.shares_count,
      isFeatured: row.is_featured,
      publishedAt: row.published_at.toISOString(),
    }));

    return { reels, total };
  }
);
