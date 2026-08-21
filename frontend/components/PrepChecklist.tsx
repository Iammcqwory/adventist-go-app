import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Square, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface PrepChecklistProps {
  userId: string;
}

const defaultReminders = [
  'Clean and tidy the house',
  'Prepare Sabbath meals',
  'Choose appropriate attire',
  'Turn off work devices',
  'Prepare study materials',
  'Set peaceful atmosphere',
  'Review family worship plan',
  'Charge devices for minimal use',
];

export function PrepChecklist({ userId }: PrepChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [newReminder, setNewReminder] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferencesData } = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => backend.sabbath.getPreferences({ userId }),
  });

  const preferences = preferencesData?.preferences;

  const savePreferencesMutation = useMutation({
    mutationFn: (prepReminders: string[]) =>
      backend.sabbath.savePreferences({ userId, prepReminders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
      toast({
        title: 'Preferences saved',
        description: 'Your preparation checklist has been updated.',
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

  const currentReminders = preferences?.prepReminders?.length 
    ? preferences.prepReminders 
    : defaultReminders;

  const handleToggleItem = (item: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(item)) {
      newCheckedItems.delete(item);
    } else {
      newCheckedItems.add(item);
    }
    setCheckedItems(newCheckedItems);
  };

  const handleAddReminder = () => {
    if (newReminder.trim()) {
      const updatedReminders = [...currentReminders, newReminder.trim()];
      savePreferencesMutation.mutate(updatedReminders);
      setNewReminder('');
      setIsAddingReminder(false);
    }
  };

  const handleRemoveReminder = (reminderToRemove: string) => {
    const updatedReminders = currentReminders.filter(reminder => reminder !== reminderToRemove);
    savePreferencesMutation.mutate(updatedReminders);
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(reminderToRemove);
      return newSet;
    });
  };

  const completedCount = Array.from(checkedItems).filter(item => 
    currentReminders.includes(item)
  ).length;

  const progressPercentage = currentReminders.length > 0 
    ? (completedCount / currentReminders.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sabbath Preparation</h1>
        <p className="text-slate-600 dark:text-gray-300">Prepare your heart and home for sacred time</p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-green-700 dark:text-green-300">Preparation Progress</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedCount}/{currentReminders.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-green-100 dark:bg-green-900 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-green-600 dark:text-green-400 text-center">
            {progressPercentage === 100 
              ? "🎉 Ready for Sabbath!" 
              : `${Math.round(progressPercentage)}% complete`
            }
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <span>Preparation Checklist</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingReminder(true)}
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingReminder && (
            <div className="flex space-x-2 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <Input
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="Enter new reminder..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()}
                className="flex-1 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
              />
              <Button onClick={handleAddReminder} size="sm">
                Add
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsAddingReminder(false);
                  setNewReminder('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {currentReminders.map((reminder, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <Checkbox
                  checked={checkedItems.has(reminder)}
                  onCheckedChange={() => handleToggleItem(reminder)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <span 
                  className={`flex-1 ${
                    checkedItems.has(reminder) 
                      ? 'line-through text-slate-500 dark:text-gray-400' 
                      : 'text-slate-700 dark:text-gray-200'
                  }`}
                >
                  {reminder}
                </span>
                {!defaultReminders.includes(reminder) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReminder(reminder)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {currentReminders.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-gray-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
              <p>No preparation items yet. Add some to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {progressPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
          <CardContent className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Preparation Complete!</h3>
            <p className="text-green-600 dark:text-green-400">
              "And God blessed the seventh day and made it holy." - Genesis 2:3
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
