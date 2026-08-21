import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Globe, Video, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChurchFinderSkeleton } from './SkeletonLoader';
import backend from '~backend/client';

interface ChurchFinderProps {
  location: { latitude: number; longitude: number } | null;
}

export function ChurchFinder({ location }: ChurchFinderProps) {
  const [searchRadius, setSearchRadius] = useState(25);

  const { data: churchesData, isLoading, error } = useQuery({
    queryKey: ['churches', location?.latitude, location?.longitude, searchRadius],
    queryFn: async () => {
      if (!location) return null;
      return backend.sabbath.findChurches({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: searchRadius,
      });
    },
    enabled: !!location,
  });

  const churches = churchesData?.churches || [];

  const formatServiceTimes = (serviceTimes: any[]) => {
    if (!serviceTimes || serviceTimes.length === 0) {
      return 'Contact church for service times';
    }
    return serviceTimes.map(time => `${time.day}: ${time.time}`).join(', ');
  };

  const openDirections = (church: any) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(church.address + ', ' + church.city)}`;
    window.open(url, '_blank');
  };

  if (!location) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Church Finder</h1>
          <p className="text-slate-600 dark:text-gray-300">Find Seventh-day Adventist churches near you</p>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">Location Required</h3>
              <p className="text-slate-500 dark:text-gray-400">Please enable location access to find churches near you.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <ChurchFinderSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Church Finder</h1>
          <p className="text-slate-600 dark:text-gray-300">Find Seventh-day Adventist churches near you</p>
        </div>

        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Find Churches</h3>
              <p className="text-red-600 dark:text-red-400">There was an error searching for churches. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Church Finder</h1>
        <p className="text-slate-600 dark:text-gray-300">Find Seventh-day Adventist churches near you</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <span>Search Settings</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-gray-300">Radius:</span>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-20 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                min="1"
                max="100"
              />
              <span className="text-sm text-slate-600 dark:text-gray-300">km</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {churches.length === 0 ? (
        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">No Churches Found</h3>
              <p className="text-slate-500 dark:text-gray-400">Try increasing the search radius or check your location.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {churches.map((church) => (
            <Card key={church.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl text-slate-800 dark:text-white">{church.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                      <span className="text-slate-600 dark:text-gray-300">{church.city}, {church.country}</span>
                      <Badge variant="outline" className="ml-2 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                        {church.distance} km away
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-slate-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-gray-200">{church.address}</span>
                </div>

                {church.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                    <a 
                      href={`tel:${church.phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {church.phone}
                    </a>
                  </div>
                )}

                {church.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                    <a 
                      href={church.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {church.livestreamUrl && (
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                    <a 
                      href={church.livestreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      Watch Livestream
                    </a>
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 text-slate-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-gray-200 text-sm">
                    {formatServiceTimes(church.serviceTimes)}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDirections(church)}
                    className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Global Fellowship</h3>
          <p className="text-blue-600 dark:text-blue-400">
            Connect with Adventist communities wherever your journey takes you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
