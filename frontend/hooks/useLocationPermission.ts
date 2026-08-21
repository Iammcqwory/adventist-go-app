import { useState, useCallback, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  cityName?: string;
  isManual?: boolean;
}

export interface PopularCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const POPULAR_CITIES: PopularCity[] = [
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Kingston', country: 'Jamaica', latitude: 17.9714, longitude: -76.7936, timezone: 'America/Jamaica' },
  { name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473, timezone: 'Africa/Johannesburg' },
  { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
];

export function useLocationPermission() {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem('adventist_user_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => {
          setPermissionStatus(result.state);
        };
      }).catch(() => {
        setPermissionStatus('unknown');
      });
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          cityName: 'My Current Location',
          isManual: false,
        };
        setLocation(detectedLocation);
        localStorage.setItem('adventist_user_location', JSON.stringify(detectedLocation));
        setIsLoading(false);
        setPermissionStatus('granted');
      },
      (geoError) => {
        setError(geoError.message);
        setIsLoading(false);
        setPermissionStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  const setManualLocation = useCallback((city: PopularCity) => {
    const manualLoc: LocationData = {
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: `${city.name}, ${city.country}`,
      isManual: true,
    };
    setLocation(manualLoc);
    localStorage.setItem('adventist_user_location', JSON.stringify(manualLoc));
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestLocation,
    setManualLocation,
  };
}
