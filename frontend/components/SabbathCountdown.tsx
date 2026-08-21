import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Sunrise, 
  Sunset, 
  Moon, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Globe,
  Flame,
  CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountdownSkeleton } from './SkeletonLoader';
import { LocationData, POPULAR_CITIES, PopularCity } from '../hooks/useLocationPermission';
import backend from '~backend/client';

interface SabbathCountdownProps {
  userId: string;
  location: LocationData | null;
  onRequestLocation?: () => void;
  onSelectCity?: (city: PopularCity) => void;
}

export function SabbathCountdown({ 
  userId, 
  location, 
  onRequestLocation, 
  onSelectCity 
}: SabbathCountdownProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Default fallback coords (Jerusalem / standard) if query needs initial data
  const activeLat = location?.latitude || 31.7683;
  const activeLng = location?.longitude || 35.2137;

  const { data: sabbathTimes, isLoading, error } = useQuery({
    queryKey: ['sabbathTimes', activeLat, activeLng],
    queryFn: async () => {
      try {
        return await backend.sabbath.getSabbathTimes({
          latitude: activeLat,
          longitude: activeLng,
        });
      } catch (err) {
        // Fallback calculated client-side dates if backend is disconnected
        const now = new Date();
        const friday = new Date(now);
        const dayOfWeek = friday.getDay();
        const diffToFriday = (5 - dayOfWeek + 7) % 7;
        friday.setDate(now.getDate() + (diffToFriday === 0 && now.getHours() >= 18 ? 7 : diffToFriday));
        friday.setHours(18, 15, 0, 0);

        const saturday = new Date(friday);
        saturday.setDate(friday.getDate() + 1);
        saturday.setHours(18, 45, 0, 0);

        return {
          fridaySunset: friday.toISOString(),
          saturdaySunset: saturday.toISOString(),
          isSabbath: dayOfWeek === 5 && now.getHours() >= 18 || (dayOfWeek === 6 && now.getHours() < 19),
          preparationTimeRemaining: 24,
          sabbathTimeRemaining: 0,
        };
      }
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return '00:00:00';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '--:--';
    }
  };

  // 1. FIRST-RUN ONBOARDING STATE (No location saved yet)
  if (!location && !showLocationPicker) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-b from-white to-blue-50/40 dark:from-gray-950 dark:to-blue-950/20 shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mx-auto mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Detected Timezone: {detectedTimezone}</span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Set Your Sabbath Location
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-gray-400 max-w-md mx-auto mt-2">
              Sabbath begins at local sunset on Friday. Choose your city or allow location access to see your accurate countdown.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Primary Action: Use GPS */}
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={onRequestLocation}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <MapPin className="w-5 h-5" />
                <span>Use My Current Location</span>
              </Button>
              <p className="text-[11px] text-center text-slate-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Private & secure: Coordinates stay on your device for sunset math.</span>
              </p>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or Select a Major City
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-gray-800"></div>
            </div>

            {/* Quick-Pick Popular Cities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_CITIES.slice(0, 6).map((city) => (
                <button
                  key={city.name}
                  onClick={() => onSelectCity?.(city)}
                  className="p-3 text-left bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-gray-800 hover:border-blue-400 rounded-xl transition-all shadow-sm group"
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {city.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500">{city.country}</p>
                </button>
              ))}
            </div>

            {/* Dropdown for All Global Cities */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5">
                More Global Cities:
              </label>
              <Select
                onValueChange={(val) => {
                  const found = POPULAR_CITIES.find((c) => c.name === val);
                  if (found && onSelectCity) onSelectCity(found);
                }}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
                  <SelectValue placeholder="Search or choose another city..." />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_CITIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}, {c.country} ({c.timezone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <CountdownSkeleton />;
  }

  const fridayDate = sabbathTimes ? new Date(sabbathTimes.fridaySunset) : new Date();
  const saturdayDate = sabbathTimes ? new Date(sabbathTimes.saturdaySunset) : new Date();
  const timeToSabbath = fridayDate.getTime() - currentTime.getTime();
  const timeToSabbathEnd = saturdayDate.getTime() - currentTime.getTime();
  const isSabbathActive = sabbathTimes?.isSabbath || (timeToSabbath <= 0 && timeToSabbathEnd > 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Location Status Bar with Change Action */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-200">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{location?.cityName || 'Jerusalem (Default)'}</span>
          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 px-2 text-slate-500">
            {location?.isManual ? 'Manual City' : 'GPS Detected'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRequestLocation}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 h-8"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Update Location</span>
        </Button>
      </div>

      {/* Main Countdown Hero Card */}
      <Card className={`border-2 shadow-2xl transition-all overflow-hidden ${
        isSabbathActive
          ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-purple-500/10'
          : 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10'
      }`}>
        <CardHeader className="text-center pb-2 pt-6">
          <div className="flex justify-center mb-3">
            <div className={`p-3 rounded-2xl ${
              isSabbathActive 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            }`}>
              {isSabbathActive ? <Moon className="w-8 h-8" /> : <Sunset className="w-8 h-8" />}
            </div>
          </div>
          <Badge className={`mx-auto font-black text-xs px-3 py-1 uppercase tracking-wider ${
            isSabbathActive 
              ? 'bg-amber-500 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {isSabbathActive ? '✨ Sabbath Shalom! Holy Hours Active' : 'Sabbath Preparation'}
          </Badge>
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            {isSabbathActive ? 'Sabbath Concludes In' : 'Sabbath Begins In'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 text-center space-y-6">
          {/* Big Digital Countdown */}
          <div className="py-4">
            <div className="text-4xl sm:text-6xl font-mono font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {isSabbathActive 
                ? formatTimeRemaining(timeToSabbathEnd)
                : formatTimeRemaining(timeToSabbath)}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
              {isSabbathActive 
                ? `Until Saturday Sunset (${formatTime(sabbathTimes?.saturdaySunset || '')})`
                : `Until Friday Sunset (${formatTime(sabbathTimes?.fridaySunset || '')})`}
            </p>
          </div>

          {/* Sunset Schedule Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-black/50 border border-slate-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Friday Sunset</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  {formatTime(sabbathTimes?.fridaySunset || '')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-black/50 border border-slate-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Saturday Sunset</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  {formatTime(sabbathTimes?.saturdaySunset || '')}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/prep" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl gap-2 shadow-md">
                <CheckSquare className="w-4 h-4" />
                <span>Open Prep Checklist</span>
              </Button>
            </Link>
            <Link to="/reels" className="flex-1">
              <Button variant="outline" className="w-full font-bold py-5 rounded-xl gap-2 border-slate-300 dark:border-gray-700">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Watch Daily Reels</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
