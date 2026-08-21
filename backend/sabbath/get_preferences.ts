import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface GetPreferencesRequest {
  userId: string;
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

interface GetPreferencesResponse {
  preferences: UserPreferences | null;
}

// Retrieves user preferences
export const getPreferences = api<GetPreferencesRequest, GetPreferencesResponse>(
  { expose: true, method: "GET", path: "/preferences/:userId" },
  async ({ userId }) => {
    const row = await sabbathDB.queryRow<{
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
      SELECT id, user_id, timezone, latitude, longitude, prep_reminders, digital_detox_enabled, created_at, updated_at
      FROM user_preferences
      WHERE user_id = ${userId}
    `;
    
    if (!row) {
      return { preferences: null };
    }
    
    return {
      preferences: {
        id: row.id,
        userId: row.user_id,
        timezone: row.timezone,
        latitude: row.latitude,
        longitude: row.longitude,
        prepReminders: row.prep_reminders || [],
        digitalDetoxEnabled: row.digital_detox_enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    };
  }
);
