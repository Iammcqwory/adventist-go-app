import { api } from "encore.dev/api";
import { sabbathDB } from "./db";

interface FindChurchesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface Church {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  livestreamUrl: string | null;
  serviceTimes: any[];
  distance: number;
}

interface FindChurchesResponse {
  churches: Church[];
}

// Finds SDA churches near a location
export const findChurches = api<FindChurchesRequest, FindChurchesResponse>(
  { expose: true, method: "GET", path: "/churches/nearby" },
  async ({ latitude, longitude, radius = 50 }) => {
    // Using Haversine formula to calculate distance
    const query = `
      SELECT id, name, address, city, country, latitude, longitude, phone, website, livestream_url, service_times,
             (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
      FROM churches
      HAVING distance < $3
      ORDER BY distance
      LIMIT 20
    `;
    
    const rows = await sabbathDB.rawQueryAll<{
      id: number;
      name: string;
      address: string;
      city: string;
      country: string;
      latitude: number;
      longitude: number;
      phone: string | null;
      website: string | null;
      livestream_url: string | null;
      service_times: any[];
      distance: number;
    }>(query, latitude, longitude, radius);
    
    const churches = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      phone: row.phone,
      website: row.website,
      livestreamUrl: row.livestream_url,
      serviceTimes: row.service_times || [],
      distance: Math.round(row.distance * 10) / 10,
    }));
    
    return { churches };
  }
);
