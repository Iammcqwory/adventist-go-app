import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface Quarter {
  id: number;
  title: string;
  subtitle: string | null;
  year: number;
  quarter: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  description: string | null;
  author: string | null;
  lessonsCount: number;
}

interface GetQuartersResponse {
  quarters: Quarter[];
}

// Retrieves all Sabbath School quarters
export const getSabbathSchoolQuarters = api<void, GetQuartersResponse>(
  { expose: true, method: "GET", path: "/sabbath-school/quarters" },
  async () => {
    const rows = await sabbathDB.queryAll<{
      id: number;
      title: string;
      subtitle: string | null;
      year: number;
      quarter: number;
      start_date: string;
      end_date: string;
      cover_image_url: string | null;
      description: string | null;
      author: string | null;
      lessons_count: number;
    }>`
      SELECT q.id, q.title, q.subtitle, q.year, q.quarter, q.start_date, q.end_date,
             q.cover_image_url, q.description, q.author,
             COUNT(l.id) as lessons_count
      FROM sabbath_school_quarters q
      LEFT JOIN sabbath_school_lessons l ON q.id = l.quarter_id
      GROUP BY q.id, q.title, q.subtitle, q.year, q.quarter, q.start_date, q.end_date,
               q.cover_image_url, q.description, q.author
      ORDER BY q.year DESC, q.quarter DESC
    `;

    const quarters = rows.map(row => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      year: row.year,
      quarter: row.quarter,
      startDate: row.start_date,
      endDate: row.end_date,
      coverImageUrl: row.cover_image_url,
      description: row.description,
      author: row.author,
      lessonsCount: Number(row.lessons_count),
    }));

    return { quarters };
  }
);
