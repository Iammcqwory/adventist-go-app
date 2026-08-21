import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, MapPin, Clock, Bell, Save, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '../contexts/ThemeContext';
import backend from '~backend/client';

interface SettingsProps {
  userId: string;
  location: { latitude: number; longitude: number } | null;
}

export function Settings({ userId, location }: SettingsProps) {
  const [settings, setSettings] = useState({
    timezone: 'UTC',
    digitalDetoxEnabled: false,
    prepReminders: [] as string[],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  const { data: preferencesData, isLoading } = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => backend.sabbath.getPreferences({ userId }),
    onSuccess: (data) => {
      if (data?.preferences) {
        setSettings({
          timezone: data.preferences.timezone,
          digitalDetoxEnabled: data.preferences.digitalDetoxEnabled,
          prepReminders: data.preferences.prepReminders,
        });
      }
    },
  });

  const preferences = preferencesData?.preferences;

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
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = () => {
    savePreferencesMutation.mutate(settings);
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-gray-300">Customize your Adventist Go experience</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <Sun className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-gray-200">Dark Mode</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center space-x-2"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Time & Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-black text-slate-700 dark:text-gray-200"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {location && (
            <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                <span className="font-medium text-slate-700 dark:text-gray-200">Current Location</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Latitude: {location.latitude.toFixed(4)}, Longitude: {location.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Used for calculating accurate Sabbath times
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Notifications & Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-gray-200">Auto Digital Detox</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Automatically enable detox mode during Sabbath hours
              </p>
            </div>
            <Switch
              checked={settings.digitalDetoxEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, digitalDetoxEnabled: checked })
              }
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Sabbath Notifications</h3>
            <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Friday sunset reminder (customizable timing)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Sabbath welcome notification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Saturday sunset notification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Custom preparation reminders</span>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/settings?tab=notifications'}
                className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                Configure Notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-2">Version</h3>
              <p className="text-slate-600 dark:text-gray-300">Adventist Go v1.1.0</p>
            </div>
            <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-2">Offline Mode</h3>
              <p className="text-slate-600 dark:text-gray-300">Enabled for all features</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border-l-4 border-green-400 dark:border-green-600">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Privacy & Data</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your data is stored locally and securely. Location is only used for Sabbath time calculations and notifications.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border-l-4 border-purple-400 dark:border-purple-600">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Browser Notifications</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Enable browser notifications to receive timely Sabbath reminders even when the app is closed.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleSaveSettings}
          disabled={savePreferencesMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {savePreferencesMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-8">
          <SettingsIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Personalized Experience</h3>
          <p className="text-blue-600 dark:text-blue-400">
            Customize Adventist Go to support your unique Sabbath journey.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
