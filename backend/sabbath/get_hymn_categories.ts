import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface HymnCategory {
  category: string;
  count: number;
}

interface GetHymnCategoriesResponse {
  categories: HymnCategory[];
}

// Retrieves all hymn categories with counts
export const getHymnCategories = api<void, GetHymnCategoriesResponse>(
  { expose: true, method: "GET", path: "/hymns/categories" },
  async () => {
    const rows = await sabbathDB.queryAll<{
      category: string;
      count: number;
    }>`
      SELECT category, COUNT(*) as count
      FROM hymns
      GROUP BY category
      ORDER BY category ASC
    `;

    const categories = rows.map(row => ({
      category: row.category,
      count: Number(row.count),
    }));

    return { categories };
  }
);
