import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetDailyStudiesRequest {
  lessonId: number;
}

interface DailyStudy {
  id: number;
  lessonId: number;
  dayOfWeek: number;
  title: string;
  scriptureReferences: string[];
  content: string;
  discussionQuestions: string[];
}

interface GetDailyStudiesResponse {
  dailyStudies: DailyStudy[];
}

// Retrieves daily studies for a specific lesson
export const getSabbathSchoolDailyStudies = api<GetDailyStudiesRequest, GetDailyStudiesResponse>(
  { expose: true, method: "GET", path: "/sabbath-school/lessons/:lessonId/daily-studies" },
  async ({ lessonId }) => {
    const rows = await sabbathDB.queryAll<{
      id: number;
      lesson_id: number;
      day_of_week: number;
      title: string;
      scripture_references: string[];
      content: string;
      discussion_questions: string[];
    }>`
      SELECT id, lesson_id, day_of_week, title, scripture_references, content, discussion_questions
      FROM sabbath_school_daily_studies
      WHERE lesson_id = ${lessonId}
      ORDER BY day_of_week ASC
    `;

    const dailyStudies = rows.map(row => ({
      id: row.id,
      lessonId: row.lesson_id,
      dayOfWeek: row.day_of_week,
      title: row.title,
      scriptureReferences: row.scripture_references || [],
      content: row.content,
      discussionQuestions: row.discussion_questions || [],
    }));

    return { dailyStudies };
  }
);
