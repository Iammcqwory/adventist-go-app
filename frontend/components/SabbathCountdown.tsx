import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Sunrise, Sunset, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownSkeleton } from './SkeletonLoader';
import backend from '~backend/client';

interface SabbathCountdownProps {
  userId: string;
  location: { latitude: number; longitude: number } | null;
}

export function SabbathCountdown({ userId, location }: SabbathCountdownProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: sabbathTimes, isLoading, error } = useQuery({
    queryKey: ['sabbathTimes', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;
      return backend.sabbath.getSabbathTimes({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    },
    enabled: !!location,
    refetchInterval: 60000, // Refetch every minute
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
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!location) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">Location Required</h3>
              <p className="text-slate-500 dark:text-gray-400">Please enable location access to see Sabbath times for your area.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <CountdownSkeleton />;
  }

  if (error || !sabbathTimes) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Calculate Sabbath Times</h3>
              <p className="text-red-600 dark:text-red-400">There was an error calculating Sabbath times for your location. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeToSabbath = new Date(sabbathTimes.fridaySunset).getTime() - currentTime.getTime();
  const timeToSabbathEnd = new Date(sabbathTimes.saturdaySunset).getTime() - currentTime.getTime();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sabbath Countdown</h1>
        <p className="text-slate-600 dark:text-gray-300">Prepare your heart for sacred time</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {sabbathTimes.isCurrentlySabbath ? (
              <>
                <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">Sabbath is Here</span>
              </>
            ) : (
              <>
                <Sunrise className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">Time Until Sabbath</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {sabbathTimes.isCurrentlySabbath ? (
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 text-lg">
                Sabbath Blessings
              </Badge>
              <div className="text-4xl font-mono font-bold text-purple-700 dark:text-purple-300">
                {formatTimeRemaining(timeToSabbathEnd)}
              </div>
              <p className="text-purple-600 dark:text-purple-400">until Sabbath ends</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-5xl font-mono font-bold text-blue-700 dark:text-blue-300">
                {formatTimeRemaining(timeToSabbath)}
              </div>
              <p className="text-blue-600 dark:text-blue-400">until Friday sunset</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
              <Sunset className="w-5 h-5" />
              <span>Friday Sunset</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
              {formatTime(sabbathTimes.fridaySunset)}
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Sabbath begins</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
              <Sunset className="w-5 h-5" />
              <span>Saturday Sunset</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              {formatTime(sabbathTimes.saturdaySunset)}
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Sabbath ends</p>
          </CardContent>
        </Card>
      </div>

      {sabbathTimes.isCurrentlySabbath && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
          <CardContent className="text-center py-8">
            <Moon className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">Sabbath Shalom</h3>
            <p className="text-purple-600 dark:text-purple-400">
              "Remember the Sabbath day, to keep it holy." - Exodus 20:8
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
