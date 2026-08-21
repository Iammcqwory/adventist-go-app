import { api } from "encore.dev/api";

interface SabbathTimesRequest {
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface SabbathTimesResponse {
  fridaySunset: string;
  saturdaySunset: string;
  timeToSabbath: number;
  isCurrentlySabbath: boolean;
}

// Calculates Sabbath start and end times based on location
export const getSabbathTimes = api<SabbathTimesRequest, SabbathTimesResponse>(
  { expose: true, method: "GET", path: "/sabbath/times" },
  async ({ latitude, longitude, timezone = "UTC" }) => {
    const now = new Date();
    const fridaySunset = calculateSunset(latitude, longitude, getNextFriday(now));
    const saturdaySunset = calculateSunset(latitude, longitude, getNextSaturday(now));
    
    const timeToSabbath = fridaySunset.getTime() - now.getTime();
    const isCurrentlySabbath = now >= fridaySunset && now <= saturdaySunset;

    return {
      fridaySunset: fridaySunset.toISOString(),
      saturdaySunset: saturdaySunset.toISOString(),
      timeToSabbath: Math.max(0, timeToSabbath),
      isCurrentlySabbath,
    };
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
  // Simplified sunset calculation - in production, use a proper astronomical library
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
  const argument = Math.sin(0.83776 * Math.PI / 180) + Math.sin(latitude * Math.PI / 180) * Math.sin(p);
  const argument2 = Math.cos(latitude * Math.PI / 180) * Math.cos(p);
  const t = 24 - (24 / Math.PI) * Math.acos(argument / argument2);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(t), Math.floor((t % 1) * 60), 0, 0);
  
  // Adjust for longitude
  const timeZoneOffset = longitude / 15;
  sunset.setHours(sunset.getHours() - timeZoneOffset);
  
  return sunset;
}
