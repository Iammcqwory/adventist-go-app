import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetPendingNotificationsRequest {
  userId: string;
  latitude: number;
  longitude: number;
}

interface PendingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  scheduledTime: string;
  isUrgent: boolean;
  data?: any;
}

interface GetPendingNotificationsResponse {
  notifications: PendingNotification[];
}

// Retrieves pending notifications for a user based on their location and Sabbath times
export const getPendingNotifications = api<GetPendingNotificationsRequest, GetPendingNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications/pending" },
  async ({ userId, latitude, longitude }) => {
    const now = new Date();
    const notifications: PendingNotification[] = [];

    // Get user's notification settings
    const settingsRow = await sabbathDB.queryRow<{
      friday_prep_reminder: boolean;
      friday_prep_reminder_time: number;
      sabbath_welcome_notification: boolean;
      sabbath_end_notification: boolean;
      custom_reminders: any[];
    }>`
      SELECT friday_prep_reminder, friday_prep_reminder_time, sabbath_welcome_notification,
             sabbath_end_notification, custom_reminders
      FROM notification_settings
      WHERE user_id = ${userId}
    `;

    if (!settingsRow) {
      return { notifications: [] };
    }

    // Calculate Sabbath times
    const fridaySunset = calculateSunset(latitude, longitude, getNextFriday(now));
    const saturdaySunset = calculateSunset(latitude, longitude, getNextSaturday(now));
    
    const timeToSabbath = fridaySunset.getTime() - now.getTime();
    const timeToSabbathEnd = saturdaySunset.getTime() - now.getTime();
    const isCurrentlySabbath = now >= fridaySunset && now <= saturdaySunset;

    // Friday preparation reminder
    if (settingsRow.friday_prep_reminder && !isCurrentlySabbath) {
      const reminderTime = new Date(fridaySunset.getTime() - (settingsRow.friday_prep_reminder_time * 60 * 1000));
      const timeToReminder = reminderTime.getTime() - now.getTime();
      
      if (timeToReminder > 0 && timeToReminder <= 60 * 60 * 1000) { // Within 1 hour
        notifications.push({
          id: 'friday-prep-reminder',
          type: 'preparation',
          title: 'Sabbath Preparation Time',
          message: `Sabbath begins in ${Math.round(timeToSabbath / (1000 * 60))} minutes. Time to prepare your heart and home!`,
          scheduledTime: reminderTime.toISOString(),
          isUrgent: timeToReminder <= 15 * 60 * 1000, // Urgent if within 15 minutes
          data: {
            timeToSabbath: timeToSabbath,
            sunsetTime: fridaySunset.toISOString(),
          }
        });
      }
    }

    // Sabbath welcome notification
    if (settingsRow.sabbath_welcome_notification && !isCurrentlySabbath) {
      const timeToWelcome = fridaySunset.getTime() - now.getTime();
      
      if (timeToWelcome > 0 && timeToWelcome <= 30 * 60 * 1000) { // Within 30 minutes
        notifications.push({
          id: 'sabbath-welcome',
          type: 'welcome',
          title: 'Sabbath Shalom!',
          message: 'The Sabbath is beginning. May you find rest and renewal in God\'s presence.',
          scheduledTime: fridaySunset.toISOString(),
          isUrgent: timeToWelcome <= 5 * 60 * 1000, // Urgent if within 5 minutes
          data: {
            sunsetTime: fridaySunset.toISOString(),
          }
        });
      }
    }

    // Sabbath end notification
    if (settingsRow.sabbath_end_notification && isCurrentlySabbath) {
      const timeToEnd = saturdaySunset.getTime() - now.getTime();
      
      if (timeToEnd > 0 && timeToEnd <= 30 * 60 * 1000) { // Within 30 minutes
        notifications.push({
          id: 'sabbath-end',
          type: 'farewell',
          title: 'Sabbath Ending Soon',
          message: `Sabbath ends in ${Math.round(timeToEnd / (1000 * 60))} minutes. Cherish these final moments of sacred time.`,
          scheduledTime: saturdaySunset.toISOString(),
          isUrgent: timeToEnd <= 10 * 60 * 1000, // Urgent if within 10 minutes
          data: {
            timeToEnd: timeToEnd,
            sunsetTime: saturdaySunset.toISOString(),
          }
        });
      }
    }

    // Custom reminders
    if (settingsRow.custom_reminders && settingsRow.custom_reminders.length > 0) {
      for (const reminder of settingsRow.custom_reminders) {
        if (reminder.enabled) {
          const reminderTime = new Date(fridaySunset.getTime() - (reminder.minutesBefore * 60 * 1000));
          const timeToReminder = reminderTime.getTime() - now.getTime();
          
          if (timeToReminder > 0 && timeToReminder <= 60 * 60 * 1000) { // Within 1 hour
            notifications.push({
              id: `custom-${reminder.id}`,
              type: 'custom',
              title: reminder.title,
              message: reminder.message,
              scheduledTime: reminderTime.toISOString(),
              isUrgent: timeToReminder <= 15 * 60 * 1000,
              data: {
                customReminder: reminder,
              }
            });
          }
        }
      }
    }

    return { notifications };
  }
);

function getNextFriday(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (daysUntilFriday === 0 && result.getHours() >= 18) {
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + daysUntilFriday);
  }
  return result;
}

function getNextSaturday(date: Date): Date {
  const friday = getNextFriday(date);
  const saturday = new Date(friday);
  saturday.setDate(saturday.getDate() + 1);
  return saturday;
}

function calculateSunset(latitude: number, longitude: number, date: Date): Date {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
  const argument = Math.sin(0.83776 * Math.PI / 180) + Math.sin(latitude * Math.PI / 180) * Math.sin(p);
  const argument2 = Math.cos(latitude * Math.PI / 180) * Math.cos(p);
  const t = 24 - (24 / Math.PI) * Math.acos(argument / argument2);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(t), Math.floor((t % 1) * 60), 0, 0);
  
  const timeZoneOffset = longitude / 15;
  sunset.setHours(sunset.getHours() - timeZoneOffset);
  
  return sunset;
}
