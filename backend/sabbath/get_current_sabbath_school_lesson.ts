import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface CurrentLesson {
  id: number;
  quarterId: number;
  quarterTitle: string;
  lessonNumber: number;
  title: string;
  subtitle: string | null;
  dateFor: string;
  memoryVerse: string | null;
  introduction: string | null;
  currentDayStudy: {
    id: number;
    dayOfWeek: number;
    title: string;
    scriptureReferences: string[];
    content: string;
    discussionQuestions: string[];
  } | null;
}

interface GetCurrentLessonResponse {
  currentLesson: CurrentLesson | null;
}

// Retrieves the current week's Sabbath School lesson
export const getCurrentSabbathSchoolLesson = api<void, GetCurrentLessonResponse>(
  { expose: true, method: "GET", path: "/sabbath-school/current" },
  async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Find the current lesson based on today's date
    const lessonRow = await sabbathDB.queryRow<{
      id: number;
      quarter_id: number;
      quarter_title: string;
      lesson_number: number;
      title: string;
      subtitle: string | null;
      date_for: string;
      memory_verse: string | null;
      introduction: string | null;
    }>`
      SELECT l.id, l.quarter_id, q.title as quarter_title, l.lesson_number, l.title, l.subtitle,
             l.date_for, l.memory_verse, l.introduction
      FROM sabbath_school_lessons l
      JOIN sabbath_school_quarters q ON l.quarter_id = q.id
      WHERE l.date_for <= ${today}
      ORDER BY l.date_for DESC
      LIMIT 1
    `;

    if (!lessonRow) {
      return { currentLesson: null };
    }

    // Get today's day of week (1 = Sunday, 7 = Saturday)
    const dayOfWeek = new Date().getDay() + 1;
    
    // Find the current day's study
    const dailyStudyRow = await sabbathDB.queryRow<{
      id: number;
      day_of_week: number;
      title: string;
      scripture_references: string[];
      content: string;
      discussion_questions: string[];
    }>`
      SELECT id, day_of_week, title, scripture_references, content, discussion_questions
      FROM sabbath_school_daily_studies
      WHERE lesson_id = ${lessonRow.id} AND day_of_week = ${dayOfWeek}
    `;

    const currentLesson: CurrentLesson = {
      id: lessonRow.id,
      quarterId: lessonRow.quarter_id,
      quarterTitle: lessonRow.quarter_title,
      lessonNumber: lessonRow.lesson_number,
      title: lessonRow.title,
      subtitle: lessonRow.subtitle,
      dateFor: lessonRow.date_for,
      memoryVerse: lessonRow.memory_verse,
      introduction: lessonRow.introduction,
      currentDayStudy: dailyStudyRow ? {
        id: dailyStudyRow.id,
        dayOfWeek: dailyStudyRow.day_of_week,
        title: dailyStudyRow.title,
        scriptureReferences: dailyStudyRow.scripture_references || [],
        content: dailyStudyRow.content,
        discussionQuestions: dailyStudyRow.discussion_questions || [],
      } : null,
    };

    return { currentLesson };
  }
);
