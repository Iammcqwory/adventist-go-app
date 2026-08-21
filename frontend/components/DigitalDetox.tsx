import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Smartphone, Moon, Sun, Shield, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface DigitalDetoxProps {
  userId: string;
}

export function DigitalDetox({ userId }: DigitalDetoxProps) {
  const [isDetoxActive, setIsDetoxActive] = useState(false);
  const [detoxStartTime, setDetoxStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferencesData } = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => backend.sabbath.getPreferences({ userId }),
  });

  const preferences = preferencesData?.preferences;

  const savePreferencesMutation = useMutation({
    mutationFn: (digitalDetoxEnabled: boolean) =>
      backend.sabbath.savePreferences({ userId, digitalDetoxEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
      toast({
        title: 'Preferences saved',
        description: 'Your digital detox settings have been updated.',
      });
    },
    onError: (error) => {
      console.error('Failed to save preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleToggleDetox = () => {
    if (!isDetoxActive) {
      setIsDetoxActive(true);
      setDetoxStartTime(new Date());
      toast({
        title: 'Digital Detox Activated',
        description: 'Enjoy your peaceful Sabbath time!',
      });
    } else {
      setIsDetoxActive(false);
      setDetoxStartTime(null);
      toast({
        title: 'Digital Detox Ended',
        description: 'Welcome back to connected time.',
      });
    }
  };

  const handleToggleAutoDetox = (enabled: boolean) => {
    savePreferencesMutation.mutate(enabled);
  };

  const formatDetoxDuration = () => {
    if (!detoxStartTime) return '00:00:00';
    
    const now = new Date();
    const diff = now.getTime() - detoxStartTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = useState(formatDetoxDuration());

  useEffect(() => {
    if (isDetoxActive) {
      const timer = setInterval(() => {
        setCurrentTime(formatDetoxDuration());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDetoxActive, detoxStartTime]);

  const detoxTips = [
    {
      icon: Moon,
      title: 'Peaceful Environment',
      description: 'Create a calm atmosphere by dimming screens and reducing digital noise.',
    },
    {
      icon: Shield,
      title: 'Mindful Boundaries',
      description: 'Set clear boundaries between sacred time and digital connectivity.',
    },
    {
      icon: Sun,
      title: 'Natural Light',
      description: 'Embrace natural lighting and outdoor activities during Sabbath.',
    },
    {
      icon: Clock,
      title: 'Intentional Time',
      description: 'Use time purposefully for worship, rest, and meaningful connections.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Digital Detox</h1>
        <p className="text-slate-600 dark:text-gray-300">Disconnect to reconnect with what matters most</p>
      </div>

      <Card className={`transition-all duration-300 ${
        isDetoxActive 
          ? 'bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-300 dark:border-green-700' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-blue-950/50 border-slate-200 dark:border-gray-800'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className={`w-6 h-6 ${isDetoxActive ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-gray-300'}`} />
              <span className={isDetoxActive ? 'text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-gray-200'}>
                Digital Detox Mode
              </span>
            </div>
            <Badge variant={isDetoxActive ? 'default' : 'secondary'} className={
              isDetoxActive ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200'
            }>
              {isDetoxActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDetoxActive && (
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-green-600 dark:text-green-400 mb-2">
                {currentTime}
              </div>
              <p className="text-green-600 dark:text-green-400">Time in peaceful mode</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleToggleDetox}
              size="lg"
              className={`px-8 py-3 ${
                isDetoxActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isDetoxActive ? (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  End Detox Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 mr-2" />
                  Start Detox Mode
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-gray-200">Auto-Enable During Sabbath</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Automatically activate detox mode from Friday sunset to Saturday sunset</p>
            </div>
            <Switch
              checked={preferences?.digitalDetoxEnabled || false}
              onCheckedChange={handleToggleAutoDetox}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Digital Wellness Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {detoxTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-1">{tip.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-300">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isDetoxActive && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Detox Mode Active</h3>
            <p className="text-green-600 dark:text-green-400">
              "Be still, and know that I am God." - Psalm 46:10
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Sabbath Screen Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-700 dark:text-gray-200">Use devices only for worship, study, and emergency communication</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-700 dark:text-gray-200">Avoid social media, entertainment, and work-related content</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-700 dark:text-gray-200">Consider airplane mode with WiFi for essential apps only</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-700 dark:text-gray-200">Use "Do Not Disturb" to minimize interruptions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
