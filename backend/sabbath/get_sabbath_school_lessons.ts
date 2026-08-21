import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetLessonsRequest {
  quarterId: number;
}

interface Lesson {
  id: number;
  quarterId: number;
  lessonNumber: number;
  title: string;
  subtitle: string | null;
  dateFor: string;
  memoryVerse: string | null;
  introduction: string | null;
  dailyStudiesCount: number;
}

interface GetLessonsResponse {
  lessons: Lesson[];
}

// Retrieves lessons for a specific quarter
export const getSabbathSchoolLessons = api<GetLessonsRequest, GetLessonsResponse>(
  { expose: true, method: "GET", path: "/sabbath-school/quarters/:quarterId/lessons" },
  async ({ quarterId }) => {
    const rows = await sabbathDB.queryAll<{
      id: number;
      quarter_id: number;
      lesson_number: number;
      title: string;
      subtitle: string | null;
      date_for: string;
      memory_verse: string | null;
      introduction: string | null;
      daily_studies_count: number;
    }>`
      SELECT l.id, l.quarter_id, l.lesson_number, l.title, l.subtitle, l.date_for,
             l.memory_verse, l.introduction,
             COUNT(ds.id) as daily_studies_count
      FROM sabbath_school_lessons l
      LEFT JOIN sabbath_school_daily_studies ds ON l.id = ds.lesson_id
      WHERE l.quarter_id = ${quarterId}
      GROUP BY l.id, l.quarter_id, l.lesson_number, l.title, l.subtitle, l.date_for,
               l.memory_verse, l.introduction
      ORDER BY l.lesson_number ASC
    `;

    const lessons = rows.map(row => ({
      id: row.id,
      quarterId: row.quarter_id,
      lessonNumber: row.lesson_number,
      title: row.title,
      subtitle: row.subtitle,
      dateFor: row.date_for,
      memoryVerse: row.memory_verse,
      introduction: row.introduction,
      dailyStudiesCount: Number(row.daily_studies_count),
    }));

    return { lessons };
  }
);
