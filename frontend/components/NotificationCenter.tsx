import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Clock, Heart, Sunset, X, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface NotificationCenterProps {
  userId: string;
  location: { latitude: number; longitude: number } | null;
  onOpenSettings: () => void;
}

interface PendingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  scheduledTime: string;
  isUrgent: boolean;
  data?: any;
}

export function NotificationCenter({ userId, location, onOpenSettings }: NotificationCenterProps) {
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const { toast } = useToast();

  const { data: notificationsData, refetch } = useQuery({
    queryKey: ['pending-notifications', userId, location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;
      return backend.sabbath.getPendingNotifications({
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    },
    enabled: !!location,
    refetchInterval: 60000, // Check every minute
  });

  const notifications = notificationsData?.notifications || [];
  const activeNotifications = notifications.filter(n => !dismissedNotifications.has(n.id));

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  useEffect(() => {
    // Show browser notifications for urgent notifications
    if (hasPermission && activeNotifications.length > 0) {
      activeNotifications.forEach(notification => {
        if (notification.isUrgent && !dismissedNotifications.has(notification.id)) {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: true,
          });

          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };

          // Auto-close after 10 seconds for non-urgent notifications
          if (!notification.isUrgent) {
            setTimeout(() => browserNotification.close(), 10000);
          }
        }
      });
    }
  }, [activeNotifications, hasPermission, dismissedNotifications]);

  const handleDismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'preparation':
        return Clock;
      case 'welcome':
        return Sunset;
      case 'farewell':
        return Heart;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800';
    }
    
    switch (type) {
      case 'preparation':
        return 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      case 'welcome':
        return 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800';
      case 'farewell':
        return 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800';
    }
  };

  const formatTimeUntil = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff <= 0) return 'Now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `in ${hours}h ${minutes % 60}m`;
    }
    return `in ${minutes}m`;
  };

  if (!location) {
    return null;
  }

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {activeNotifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const colorClass = getNotificationColor(notification.type, notification.isUrgent);
        
        return (
          <Card key={notification.id} className={`${colorClass} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-lg">{notification.title}</span>
                  {notification.isUrgent && (
                    <Badge variant="destructive" className="bg-red-600 text-white">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm opacity-75">
                    {formatTimeUntil(notification.scheduledTime)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissNotification(notification.id)}
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="mb-4">{notification.message}</p>
              
              {notification.type === 'preparation' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/prep'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Checklist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenSettings}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </div>
              )}
              
              {notification.type === 'welcome' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/devotionals'}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Begin Study
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/detox'}
                  >
                    Digital Detox
                  </Button>
                </div>
              )}
              
              {notification.type === 'farewell' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/journal'}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Reflect & Journal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
