import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock, Plus, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    fridayPrepReminder: true,
    fridayPrepReminderTime: 120,
    sabbathWelcomeNotification: true,
    sabbathEndNotification: true,
    customReminders: [] as any[],
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustomReminder, setNewCustomReminder] = useState({
    title: '',
    message: '',
    minutesBefore: 60,
    enabled: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationSettingsData, isLoading } = useQuery({
    queryKey: ['notification-settings', userId],
    queryFn: () => backend.sabbath.getNotificationSettings({ userId }),
    onSuccess: (data) => {
      if (data?.settings) {
        setSettings({
          fridayPrepReminder: data.settings.fridayPrepReminder,
          fridayPrepReminderTime: data.settings.fridayPrepReminderTime,
          sabbathWelcomeNotification: data.settings.sabbathWelcomeNotification,
          sabbathEndNotification: data.settings.sabbathEndNotification,
          customReminders: data.settings.customReminders,
        });
      }
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: any) =>
      backend.sabbath.saveNotificationSettings({
        userId,
        ...newSettings,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', userId] });
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
      });
    },
    onError: (error) => {
      console.error('Failed to save notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your notification settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleAddCustomReminder = () => {
    if (!newCustomReminder.title.trim() || !newCustomReminder.message.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and message for the reminder.',
        variant: 'destructive',
      });
      return;
    }

    const customReminder = {
      ...newCustomReminder,
      id: Date.now().toString(),
    };

    setSettings({
      ...settings,
      customReminders: [...settings.customReminders, customReminder],
    });

    setNewCustomReminder({
      title: '',
      message: '',
      minutesBefore: 60,
      enabled: true,
    });
    setIsAddingCustom(false);
  };

  const handleRemoveCustomReminder = (reminderId: string) => {
    setSettings({
      ...settings,
      customReminders: settings.customReminders.filter(r => r.id !== reminderId),
    });
  };

  const handleToggleCustomReminder = (reminderId: string, enabled: boolean) => {
    setSettings({
      ...settings,
      customReminders: settings.customReminders.map(r =>
        r.id === reminderId ? { ...r, enabled } : r
      ),
    });
  };

  const formatReminderTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Sabbath Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-gray-200">Friday Preparation Reminder</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Get notified before Sabbath begins to prepare your heart and home
                </p>
              </div>
              <Switch
                checked={settings.fridayPrepReminder}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, fridayPrepReminder: checked })
                }
              />
            </div>

            {settings.fridayPrepReminder && (
              <div className="ml-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Remind me this many minutes before sunset:
                </label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={settings.fridayPrepReminderTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fridayPrepReminderTime: parseInt(e.target.value) || 120,
                      })
                    }
                    className="w-24 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                    min="5"
                    max="480"
                  />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    ({formatReminderTime(settings.fridayPrepReminderTime)} before sunset)
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-gray-200">Sabbath Welcome Notification</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Receive a blessing when Sabbath begins at sunset
                </p>
              </div>
              <Switch
                checked={settings.sabbathWelcomeNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, sabbathWelcomeNotification: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-gray-200">Sabbath End Notification</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Get notified when Sabbath is ending on Saturday evening
                </p>
              </div>
              <Switch
                checked={settings.sabbathEndNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, sabbathEndNotification: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span>Custom Reminders</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCustom(true)}
              className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingCustom && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-4">New Custom Reminder</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Title
                  </label>
                  <Input
                    value={newCustomReminder.title}
                    onChange={(e) =>
                      setNewCustomReminder({ ...newCustomReminder, title: e.target.value })
                    }
                    placeholder="e.g., Light Sabbath candles"
                    className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={newCustomReminder.message}
                    onChange={(e) =>
                      setNewCustomReminder({ ...newCustomReminder, message: e.target.value })
                    }
                    placeholder="e.g., Don't forget to light the Sabbath candles and say the blessing"
                    rows={3}
                    className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Minutes before sunset
                  </label>
                  <Input
                    type="number"
                    value={newCustomReminder.minutesBefore}
                    onChange={(e) =>
                      setNewCustomReminder({
                        ...newCustomReminder,
                        minutesBefore: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-24 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                    min="5"
                    max="480"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddCustomReminder} size="sm">
                    Add Reminder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingCustom(false);
                      setNewCustomReminder({
                        title: '',
                        message: '',
                        minutesBefore: 60,
                        enabled: true,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {settings.customReminders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
              <p>No custom reminders yet. Add some to personalize your Sabbath preparation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.customReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-slate-700 dark:text-gray-200">
                        {reminder.title}
                      </h4>
                      <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                        {formatReminderTime(reminder.minutesBefore)} before
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
                      {reminder.message}
                    </p>
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(checked) =>
                        handleToggleCustomReminder(reminder.id, checked)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-8">
          <Bell className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Timely Reminders</h3>
          <p className="text-blue-600 dark:text-blue-400">
            Stay connected to sacred time with gentle, meaningful notifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
