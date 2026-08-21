import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface BibleTranslation {
  id: number;
  abbreviation: string;
  name: string;
  language: string;
  description: string | null;
  copyrightInfo: string | null;
  isDefault: boolean;
}

interface GetBibleTranslationsResponse {
  translations: BibleTranslation[];
}

// Retrieves all available Bible translations
export const getBibleTranslations = api<void, GetBibleTranslationsResponse>(
  { expose: true, method: "GET", path: "/bible/translations" },
  async () => {
    const rows = await sabbathDB.queryAll<{
      id: number;
      abbreviation: string;
      name: string;
      language: string;
      description: string | null;
      copyright_info: string | null;
      is_default: boolean;
    }>`
      SELECT id, abbreviation, name, language, description, copyright_info, is_default
      FROM bible_translations
      ORDER BY is_default DESC, name ASC
    `;

    const translations = rows.map(row => ({
      id: row.id,
      abbreviation: row.abbreviation,
      name: row.name,
      language: row.language,
      description: row.description,
      copyrightInfo: row.copyright_info,
      isDefault: row.is_default,
    }));

    return { translations };
  }
);
