import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetNotificationSettingsRequest {
  userId: string;
}

interface NotificationSettings {
  id: number;
  userId: string;
  fridayPrepReminder: boolean;
  fridayPrepReminderTime: number;
  sabbathWelcomeNotification: boolean;
  sabbathEndNotification: boolean;
  customReminders: any[];
  createdAt: string;
  updatedAt: string;
}

interface GetNotificationSettingsResponse {
  settings: NotificationSettings | null;
}

// Retrieves notification settings for a user
export const getNotificationSettings = api<GetNotificationSettingsRequest, GetNotificationSettingsResponse>(
  { expose: true, method: "GET", path: "/notifications/settings/:userId" },
  async ({ userId }) => {
    const row = await sabbathDB.queryRow<{
      id: number;
      user_id: string;
      friday_prep_reminder: boolean;
      friday_prep_reminder_time: number;
      sabbath_welcome_notification: boolean;
      sabbath_end_notification: boolean;
      custom_reminders: any[];
      created_at: string;
      updated_at: string;
    }>`
      SELECT id, user_id, friday_prep_reminder, friday_prep_reminder_time, 
             sabbath_welcome_notification, sabbath_end_notification, custom_reminders,
             created_at, updated_at
      FROM notification_settings
      WHERE user_id = ${userId}
    `;
    
    if (!row) {
      return { settings: null };
    }
    
    return {
      settings: {
        id: row.id,
        userId: row.user_id,
        fridayPrepReminder: row.friday_prep_reminder,
        fridayPrepReminderTime: row.friday_prep_reminder_time,
        sabbathWelcomeNotification: row.sabbath_welcome_notification,
        sabbathEndNotification: row.sabbath_end_notification,
        customReminders: row.custom_reminders || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    };
  }
);
