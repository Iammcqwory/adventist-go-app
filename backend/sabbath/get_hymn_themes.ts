import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface HymnTheme {
  theme: string;
  count: number;
}

interface GetHymnThemesResponse {
  themes: HymnTheme[];
}

// Retrieves all hymn themes with counts
export const getHymnThemes = api<void, GetHymnThemesResponse>(
  { expose: true, method: "GET", path: "/hymns/themes" },
  async () => {
    const rows = await sabbathDB.queryAll<{
      theme: string;
      count: number;
    }>`
      SELECT theme, COUNT(*) as count
      FROM (
        SELECT jsonb_array_elements_text(themes) as theme
        FROM hymns
        WHERE themes IS NOT NULL AND jsonb_array_length(themes) > 0
      ) theme_list
      GROUP BY theme
      ORDER BY count DESC, theme ASC
    `;

    const themes = rows.map(row => ({
      theme: row.theme,
      count: Number(row.count),
    }));

    return { themes };
  }
);
