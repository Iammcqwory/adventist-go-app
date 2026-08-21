import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SaveNotificationSettingsRequest {
  userId: string;
  fridayPrepReminder?: boolean;
  fridayPrepReminderTime?: number;
  sabbathWelcomeNotification?: boolean;
  sabbathEndNotification?: boolean;
  customReminders?: any[];
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

// Saves notification settings for a user
export const saveNotificationSettings = api<SaveNotificationSettingsRequest, NotificationSettings>(
  { expose: true, method: "POST", path: "/notifications/settings" },
  async ({ 
    userId, 
    fridayPrepReminder, 
    fridayPrepReminderTime, 
    sabbathWelcomeNotification, 
    sabbathEndNotification, 
    customReminders 
  }) => {
    const existingRow = await sabbathDB.queryRow<{ id: number }>`
      SELECT id FROM notification_settings WHERE user_id = ${userId}
    `;
    
    let row;
    if (existingRow) {
      row = await sabbathDB.queryRow<{
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
        UPDATE notification_settings
        SET friday_prep_reminder = COALESCE(${fridayPrepReminder}, friday_prep_reminder),
            friday_prep_reminder_time = COALESCE(${fridayPrepReminderTime}, friday_prep_reminder_time),
            sabbath_welcome_notification = COALESCE(${sabbathWelcomeNotification}, sabbath_welcome_notification),
            sabbath_end_notification = COALESCE(${sabbathEndNotification}, sabbath_end_notification),
            custom_reminders = COALESCE(${JSON.stringify(customReminders || [])}, custom_reminders),
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING id, user_id, friday_prep_reminder, friday_prep_reminder_time,
                  sabbath_welcome_notification, sabbath_end_notification, custom_reminders,
                  created_at, updated_at
      `;
    } else {
      row = await sabbathDB.queryRow<{
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
        INSERT INTO notification_settings (
          user_id, friday_prep_reminder, friday_prep_reminder_time,
          sabbath_welcome_notification, sabbath_end_notification, custom_reminders
        )
        VALUES (
          ${userId}, ${fridayPrepReminder || true}, ${fridayPrepReminderTime || 120},
          ${sabbathWelcomeNotification || true}, ${sabbathEndNotification || true}, 
          ${JSON.stringify(customReminders || [])}
        )
        RETURNING id, user_id, friday_prep_reminder, friday_prep_reminder_time,
                  sabbath_welcome_notification, sabbath_end_notification, custom_reminders,
                  created_at, updated_at
      `;
    }
    
    if (!row) {
      throw new Error("Failed to save notification settings");
    }
    
    return {
      id: row.id,
      userId: row.user_id,
      fridayPrepReminder: row.friday_prep_reminder,
      fridayPrepReminderTime: row.friday_prep_reminder_time,
      sabbathWelcomeNotification: row.sabbath_welcome_notification,
      sabbathEndNotification: row.sabbath_end_notification,
      customReminders: row.custom_reminders || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
