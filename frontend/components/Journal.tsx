import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PenTool, Calendar, Heart, Plus, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface JournalProps {
  userId: string;
}

export function Journal({ userId }: JournalProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    entryType: 'reflection',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: journalData, isLoading } = useQuery({
    queryKey: ['journal', userId],
    queryFn: () => backend.sabbath.getJournalEntries({ userId }),
  });

  const saveEntryMutation = useMutation({
    mutationFn: (entry: any) =>
      backend.sabbath.saveJournalEntry({
        userId,
        title: entry.title || undefined,
        content: entry.content,
        entryDate: new Date().toISOString().split('T')[0],
        entryType: entry.entryType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', userId] });
      setIsWriting(false);
      setNewEntry({ title: '', content: '', entryType: 'reflection' });
      toast({
        title: 'Entry saved',
        description: 'Your journal entry has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to save journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your journal entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const entries = journalData?.entries || [];

  const handleSaveEntry = () => {
    if (!newEntry.content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please write something before saving your entry.',
        variant: 'destructive',
      });
      return;
    }
    saveEntryMutation.mutate(newEntry);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEntryTypeColor = (type: string) => {
    const colors = {
      reflection: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      prayer: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      gratitude: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      testimony: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    };
    return colors[type as keyof typeof colors] || colors.reflection;
  };

  const journalPrompts = [
    "What did God teach me this Sabbath?",
    "How did I experience God's presence today?",
    "What am I grateful for this week?",
    "How can I better honor the Sabbath?",
    "What prayers were answered this week?",
    "How did I serve others during this Sabbath?",
    "What Bible verse spoke to my heart today?",
    "How did I rest and find peace today?",
  ];

  if (selectedEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedEntry(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Journal
          </Button>
          <Badge variant="secondary" className={getEntryTypeColor(selectedEntry.entryType)}>
            {selectedEntry.entryType}
          </Badge>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedEntry.title || 'Untitled Entry'}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedEntry.entryDate)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedEntry.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWriting) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setIsWriting(false)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Journal
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white">New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Title (optional)
              </label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Give your entry a title..."
                className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Type
              </label>
              <select
                value={newEntry.entryType}
                onChange={(e) => setNewEntry({ ...newEntry, entryType: e.target.value })}
                className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-black text-slate-700 dark:text-gray-200"
              >
                <option value="reflection">Reflection</option>
                <option value="prayer">Prayer</option>
                <option value="gratitude">Gratitude</option>
                <option value="testimony">Testimony</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Content
              </label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Write your thoughts, prayers, or reflections..."
                rows={12}
                className="resize-none bg-white dark:bg-black border-slate-300 dark:border-gray-600"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveEntry}
                disabled={saveEntryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saveEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsWriting(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Writing Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {journalPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setNewEntry({ ...newEntry, content: newEntry.content + prompt + '\n\n' })}
                  className="text-left p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Prayer & Reflection Journal</h1>
        <p className="text-slate-600 dark:text-gray-300">Capture your spiritual journey and God's blessings</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <span>My Journal</span>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <PenTool className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-500 dark:text-gray-400">Loading your journal...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">Start Your Journal</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-4">Begin documenting your spiritual journey and reflections.</p>
              <Button
                onClick={() => setIsWriting(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card 
                  key={entry.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {entry.title || 'Untitled Entry'}
                      </h3>
                      <Badge variant="secondary" className={getEntryTypeColor(entry.entryType)}>
                        {entry.entryType}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(entry.entryDate)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-sm line-clamp-2">
                      {entry.content.substring(0, 150)}
                      {entry.content.length > 150 && '...'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
        <CardContent className="text-center py-8">
          <Heart className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">Spiritual Growth</h3>
          <p className="text-purple-600 dark:text-purple-400">
            "Search me, O God, and know my heart; test me and know my anxious thoughts." - Psalm 139:23
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
