import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, Calendar, User, Quote, Volume2, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioPlayer } from './AudioPlayer';
import { DevotionalsSkeleton, ListSkeleton } from './SkeletonLoader';
import backend from '~backend/client';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'sabbath-school', label: 'Sabbath School' },
  { value: 'ellen-white', label: 'Ellen White' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'youth', label: 'Youth' },
  { value: 'family', label: 'Family' },
  { value: 'general', label: 'General' },
];

export function Devotionals() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDevotional, setSelectedDevotional] = useState<any>(null);
  const [showAudioOnly, setShowAudioOnly] = useState(false);

  const { data: devotionalsData, isLoading, error } = useQuery({
    queryKey: ['devotionals', selectedCategory],
    queryFn: () => backend.sabbath.getDevotionals({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    }),
  });

  const devotionals = devotionalsData?.devotionals || [];

  // Filter devotionals to show only those with audio if showAudioOnly is true
  const filteredDevotionals = showAudioOnly 
    ? devotionals.filter(devotional => getAudioUrl(devotional)) 
    : devotionals;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'General';
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mock audio URL generator for demo purposes
  const getAudioUrl = (devotional: any) => {
    // In a real implementation, this would come from the database
    // For demo, we'll simulate some devotionals having audio
    const devotionalIds = [1, 2, 4, 6, 8, 10, 13, 16, 19, 22];
    if (devotionalIds.includes(devotional.id)) {
      return `https://example.com/audio/devotional-${devotional.id}.mp3`;
    }
    return null;
  };

  const getAudioDuration = (devotional: any) => {
    // Mock duration for demo purposes
    return Math.floor(Math.random() * 600) + 300; // 5-15 minutes
  };

  if (isLoading && !devotionalsData) {
    return <DevotionalsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Devotionals & Study</h1>
          <p className="text-slate-600 dark:text-gray-300">Spiritual nourishment for your Sabbath journey</p>
        </div>
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Book className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Devotionals</h3>
              <p className="text-red-600 dark:text-red-400">There was an error loading the devotionals. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedDevotional) {
    const audioUrl = getAudioUrl(selectedDevotional);
    const audioDuration = audioUrl ? getAudioDuration(selectedDevotional) : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDevotional(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to List
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {selectedDevotional.category}
          </Badge>
          {audioUrl && (
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              <Volume2 className="w-3 h-3 mr-1" />
              Audio Available
            </Badge>
          )}
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedDevotional.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400">
              {selectedDevotional.author && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{selectedDevotional.author}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedDevotional.dateFor)}</span>
              </div>
              {audioDuration && (
                <div className="flex items-center space-x-1">
                  <Headphones className="w-4 h-4" />
                  <span>{formatDuration(audioDuration)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedDevotional.scriptureReference && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                <div className="flex items-center space-x-2 mb-2">
                  <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Scripture Reference</span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {selectedDevotional.scriptureReference}
                </p>
              </div>
            )}

            {audioUrl && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Headphones className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Listen to Devotional</span>
                </div>
                <AudioPlayer
                  src={audioUrl}
                  title={selectedDevotional.title}
                  duration={audioDuration}
                />
                <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    💡 <strong>Tip:</strong> Listen while following along with the text below for a deeper devotional experience.
                  </p>
                </div>
              </div>
            )}
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div 
                className="text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: selectedDevotional.content }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Devotionals & Study</h1>
        <p className="text-slate-600 dark:text-gray-300">Spiritual nourishment for your Sabbath journey</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <span>Study Materials</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="audioOnlyDevotionals"
                  checked={showAudioOnly}
                  onChange={(e) => setShowAudioOnly(e.target.checked)}
                  className="rounded border-slate-300 dark:border-gray-600"
                />
                <label htmlFor="audioOnlyDevotionals" className="text-sm text-slate-700 dark:text-gray-200 cursor-pointer">
                  Audio only
                </label>
                <Volume2 className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton count={4} />
          ) : filteredDevotionals.length === 0 ? (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-gray-400">
                {showAudioOnly 
                  ? 'No devotionals with audio found for this category.' 
                  : 'No devotionals found for this category.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevotionals.map((devotional) => {
                const audioUrl = getAudioUrl(devotional);
                const audioDuration = audioUrl ? getAudioDuration(devotional) : null;
                
                return (
                  <Card 
                    key={devotional.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                    onClick={() => setSelectedDevotional(devotional)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                              {devotional.title}
                            </h3>
                            {audioUrl && (
                              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                <Volume2 className="w-3 h-3 mr-1" />
                                {audioDuration && formatDuration(audioDuration)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400 mb-2">
                            {devotional.author && (
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{devotional.author}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(devotional.dateFor)}</span>
                            </div>
                          </div>
                          {devotional.scriptureReference && (
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              {devotional.scriptureReference}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                            {devotional.category}
                          </Badge>
                          {audioUrl && (
                            <div className="text-green-600 dark:text-green-400">
                              <Headphones className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-8">
          <Book className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Immersive Study Experience</h3>
          <p className="text-blue-600 dark:text-blue-400">
            Listen to audio devotionals while reading along for deeper spiritual engagement during Sabbath.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
