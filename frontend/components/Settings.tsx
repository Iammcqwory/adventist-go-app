import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Clock, 
  Bell, 
  Save, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '../contexts/ThemeContext';
import backend from '~backend/client';

interface SettingsProps {
  userId: string;
  location: { latitude: number; longitude: number } | null;
}

export function Settings({ userId, location }: SettingsProps) {
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [settings, setSettings] = useState({
    timezone: detectedTimezone || 'UTC',
    digitalDetoxEnabled: false,
    prepReminders: [] as string[],
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const { data: preferencesData, isLoading } = useQuery({
    queryKey: ['preferences', userId],
    queryFn: async () => {
      try {
        return await backend.sabbath.getPreferences({ userId });
      } catch (err) {
        return null;
      }
    },
  });

  useEffect(() => {
    if (preferencesData?.preferences) {
      setSettings({
        timezone: preferencesData.preferences.timezone || detectedTimezone,
        digitalDetoxEnabled: preferencesData.preferences.digitalDetoxEnabled,
        prepReminders: preferencesData.preferences.prepReminders || [],
      });
    }
  }, [preferencesData, detectedTimezone]);

  const savePreferencesMutation = useMutation({
    mutationFn: (newSettings: any) =>
      backend.sabbath.savePreferences({
        userId,
        timezone: newSettings.timezone,
        latitude: location?.latitude,
        longitude: location?.longitude,
        digitalDetoxEnabled: newSettings.digitalDetoxEnabled,
        prepReminders: newSettings.prepReminders,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    },
    onError: (error) => {
      console.warn('Preferences fallback saved locally:', error);
      localStorage.setItem('adventist_settings', JSON.stringify(settings));
      toast({
        title: 'Preferences Saved',
        description: 'Your settings have been saved locally on this device.',
      });
    },
  });

  const handleSaveSettings = () => {
    savePreferencesMutation.mutate(settings);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Browser notifications are not supported on this device.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will receive Sabbath sunset and preparation alerts.',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'You can enable notifications anytime in your browser settings.',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const timezones = [
    detectedTimezone,
    'Africa/Nairobi',
    'Africa/Johannesburg',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Jamaica',
    'America/Sao_Paulo',
    'America/Toronto',
    'Asia/Seoul',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Pacific/Auckland',
    'UTC',
  ].filter((tz, index, self) => self.indexOf(tz) === index);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1.5">Settings</h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Personalize your local Sabbath countdown, theme, and reminders
        </p>
      </div>

      {/* Appearance Card */}
      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white text-lg">
            <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Theme & Appearance</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Choose between daytime light theme or high-contrast dark sanctuary mode
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-1">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
              Current: {theme} Mode
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {theme === 'light' ? 'Light background with blue accents' : 'Dark OLED-friendly aesthetic'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl text-xs font-semibold"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>Switch to {theme === 'light' ? 'Dark' : 'Light'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Timezone & Sabbath Timing Card */}
      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white text-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Timezone & Sunset Math</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Used to calculate the exact moment the Sabbath begins and ends in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Active Timezone
            </label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => setSettings({ ...settings, timezone: value })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 border-slate-300 dark:border-gray-700">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz} {tz === detectedTimezone ? '(Auto-Detected)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Browser detected: <strong>{detectedTimezone}</strong></span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Reminders Card */}
      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white text-lg">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Sabbath Reminders</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Get notified before sunset on Friday to start winding down for the holy hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Browser Notification Status
                </p>
                <Badge
                  className={`text-[10px] uppercase font-bold py-0.5 px-2 ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-500 text-white'
                      : notificationPermission === 'denied'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {notificationPermission === 'granted'
                    ? 'Enabled'
                    : notificationPermission === 'denied'
                    ? 'Blocked'
                    : 'Permission Needed'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {notificationPermission === 'granted'
                  ? 'Active: Ready to receive Friday sunset countdown alerts'
                  : 'Tap below to grant permission in your browser'}
              </p>
            </div>
            {notificationPermission !== 'granted' && (
              <Button
                size="sm"
                onClick={requestNotificationPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Enable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Action */}
      <div className="pt-2 flex justify-end">
        <Button
          size="lg"
          onClick={handleSaveSettings}
          disabled={savePreferencesMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{savePreferencesMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  );
}
