import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface SavePreferencesRequest {
  userId: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  prepReminders?: string[];
  digitalDetoxEnabled?: boolean;
}

interface UserPreferences {
  id: number;
  userId: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  prepReminders: string[];
  digitalDetoxEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Saves user preferences for Sabbath preparation
export const savePreferences = api<SavePreferencesRequest, UserPreferences>(
  { expose: true, method: "POST", path: "/preferences" },
  async ({ userId, timezone, latitude, longitude, prepReminders, digitalDetoxEnabled }) => {
    const existingRow = await sabbathDB.queryRow<{ id: number }>`
      SELECT id FROM user_preferences WHERE user_id = ${userId}
    `;
    
    let row;
    if (existingRow) {
      row = await sabbathDB.queryRow<{
        id: number;
        user_id: string;
        timezone: string;
        latitude: number | null;
        longitude: number | null;
        prep_reminders: string[];
        digital_detox_enabled: boolean;
        created_at: string;
        updated_at: string;
      }>`
        UPDATE user_preferences
        SET timezone = COALESCE(${timezone}, timezone),
            latitude = COALESCE(${latitude}, latitude),
            longitude = COALESCE(${longitude}, longitude),
            prep_reminders = COALESCE(${JSON.stringify(prepReminders || [])}, prep_reminders),
            digital_detox_enabled = COALESCE(${digitalDetoxEnabled}, digital_detox_enabled),
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING id, user_id, timezone, latitude, longitude, prep_reminders, digital_detox_enabled, created_at, updated_at
      `;
    } else {
      row = await sabbathDB.queryRow<{
        id: number;
        user_id: string;
        timezone: string;
        latitude: number | null;
        longitude: number | null;
        prep_reminders: string[];
        digital_detox_enabled: boolean;
        created_at: string;
        updated_at: string;
      }>`
        INSERT INTO user_preferences (user_id, timezone, latitude, longitude, prep_reminders, digital_detox_enabled)
        VALUES (${userId}, ${timezone || 'UTC'}, ${latitude}, ${longitude}, ${JSON.stringify(prepReminders || [])}, ${digitalDetoxEnabled || false})
        RETURNING id, user_id, timezone, latitude, longitude, prep_reminders, digital_detox_enabled, created_at, updated_at
      `;
    }
    
    if (!row) {
      throw new Error("Failed to save preferences");
    }
    
    return {
      id: row.id,
      userId: row.user_id,
      timezone: row.timezone,
      latitude: row.latitude,
      longitude: row.longitude,
      prepReminders: row.prep_reminders || [],
      digitalDetoxEnabled: row.digital_detox_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
