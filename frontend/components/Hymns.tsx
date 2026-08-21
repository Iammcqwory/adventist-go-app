import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, Search, Book, Heart, Filter, Play, Pause, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioPlayer } from './AudioPlayer';
import { HymnsSkeleton, ListSkeleton } from './SkeletonLoader';
import backend from '~backend/client';

export function Hymns() {
  const [selectedHymn, setSelectedHymn] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [showAudioOnly, setShowAudioOnly] = useState(false);

  const pageSize = 20;

  const { data: hymnsData, isLoading, error } = useQuery({
    queryKey: ['hymns', searchTerm, selectedCategory, selectedTheme, currentPage],
    queryFn: () => backend.sabbath.getHymns({
      search: searchTerm || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      theme: selectedTheme === 'all' ? undefined : selectedTheme,
      limit: pageSize,
      offset: currentPage * pageSize,
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['hymn-categories'],
    queryFn: () => backend.sabbath.getHymnCategories(),
  });

  const { data: themesData } = useQuery({
    queryKey: ['hymn-themes'],
    queryFn: () => backend.sabbath.getHymnThemes(),
  });

  const hymns = hymnsData?.hymns || [];
  const totalHymns = hymnsData?.total || 0;
  const categories = categoriesData?.categories || [];
  const themes = themesData?.themes || [];
  const totalPages = Math.ceil(totalHymns / pageSize);

  // Filter hymns to show only those with audio if showAudioOnly is true
  const filteredHymns = showAudioOnly 
    ? hymns.filter(hymn => hymn.audioUrl) 
    : hymns;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(0);
  };

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value);
    setCurrentPage(0);
  };

  const formatLyrics = (lyrics: string) => {
    return lyrics.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
        {line || '\u00A0'}
      </div>
    ));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mock audio URL generator for demo purposes
  const getAudioUrl = (hymn: any) => {
    // In a real implementation, this would come from the database
    // For demo, we'll simulate some hymns having audio
    const hymnIds = [1, 3, 5, 7, 9, 12, 15, 18, 21, 24];
    if (hymnIds.includes(hymn.id)) {
      return `https://example.com/audio/hymn-${hymn.id}.mp3`;
    }
    return null;
  };

  const getAudioDuration = (hymn: any) => {
    // Mock duration for demo purposes
    return Math.floor(Math.random() * 180) + 120; // 2-5 minutes
  };

  if (isLoading && !hymnsData) {
    return <HymnsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Hymns & Songs</h1>
          <p className="text-slate-600 dark:text-gray-300">Lift your voice in praise and worship</p>
        </div>
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Music className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Hymns</h3>
              <p className="text-red-600 dark:text-red-400">There was an error loading the hymns. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedHymn) {
    const audioUrl = getAudioUrl(selectedHymn);
    const audioDuration = audioUrl ? getAudioDuration(selectedHymn) : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedHymn(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Hymns
          </Button>
          {selectedHymn.number && (
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              #{selectedHymn.number}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
            {selectedHymn.category}
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
              {selectedHymn.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-gray-400">
              {selectedHymn.author && (
                <span>Words: {selectedHymn.author}</span>
              )}
              {selectedHymn.composer && (
                <span>Music: {selectedHymn.composer}</span>
              )}
              {selectedHymn.keySignature && (
                <span>Key: {selectedHymn.keySignature}</span>
              )}
              {selectedHymn.timeSignature && (
                <span>Time: {selectedHymn.timeSignature}</span>
              )}
              {audioDuration && (
                <span>Duration: {formatDuration(audioDuration)}</span>
              )}
            </div>
            {selectedHymn.themes && selectedHymn.themes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedHymn.themes.map((theme: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedHymn.scriptureReference && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                <div className="flex items-center space-x-2 mb-2">
                  <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Scripture Reference</span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {selectedHymn.scriptureReference}
                </p>
              </div>
            )}

            {audioUrl && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Music className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-700 dark:text-green-300">Listen to Hymn</span>
                </div>
                <AudioPlayer
                  src={audioUrl}
                  title={selectedHymn.title}
                  duration={audioDuration}
                />
              </div>
            )}
            
            <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="font-mono text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-center">
                {formatLyrics(selectedHymn.lyrics)}
              </div>
            </div>

            {selectedHymn.copyrightInfo && (
              <div className="text-xs text-slate-500 dark:text-gray-400 text-center border-t pt-4">
                {selectedHymn.copyrightInfo}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Hymns & Songs</h1>
        <p className="text-slate-600 dark:text-gray-300">Lift your voice in praise and worship</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search hymns by title, lyrics, or author..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Theme
              </label>
              <Select value={selectedTheme} onValueChange={handleThemeChange}>
                <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="All themes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {themes.slice(0, 20).map((theme) => (
                    <SelectItem key={theme.theme} value={theme.theme}>
                      {theme.theme} ({theme.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Audio Filter
              </label>
              <div className="flex items-center space-x-2 p-2 border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-black">
                <input
                  type="checkbox"
                  id="audioOnly"
                  checked={showAudioOnly}
                  onChange={(e) => setShowAudioOnly(e.target.checked)}
                  className="rounded border-slate-300 dark:border-gray-600"
                />
                <label htmlFor="audioOnly" className="text-sm text-slate-700 dark:text-gray-200 cursor-pointer">
                  Audio only
                </label>
                <Volume2 className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <span>Hymns ({showAudioOnly ? filteredHymns.length : totalHymns} {showAudioOnly ? 'with audio' : 'total'})</span>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500 dark:text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filteredHymns.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-gray-400">
                {showAudioOnly 
                  ? 'No hymns with audio found matching your criteria.' 
                  : 'No hymns found matching your criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHymns.map((hymn) => {
                const audioUrl = getAudioUrl(hymn);
                const audioDuration = audioUrl ? getAudioDuration(hymn) : null;
                
                return (
                  <Card 
                    key={hymn.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                    onClick={() => setSelectedHymn(hymn)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {hymn.number && (
                              <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                                #{hymn.number}
                              </Badge>
                            )}
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                              {hymn.title}
                            </h3>
                            {audioUrl && (
                              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                <Volume2 className="w-3 h-3 mr-1" />
                                {audioDuration && formatDuration(audioDuration)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400 mb-2">
                            {hymn.author && <span>Words: {hymn.author}</span>}
                            {hymn.composer && <span>Music: {hymn.composer}</span>}
                          </div>
                          {hymn.themes && hymn.themes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {hymn.themes.slice(0, 3).map((theme, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                  {theme}
                                </Badge>
                              ))}
                              {hymn.themes.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                  +{hymn.themes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                            {hymn.category}
                          </Badge>
                          {audioUrl && (
                            <div className="text-green-600 dark:text-green-400">
                              <Play className="w-5 h-5" />
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

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
        <CardContent className="text-center py-8">
          <Heart className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">Worship in Song</h3>
          <p className="text-purple-600 dark:text-purple-400">
            "Sing to the Lord a new song; sing to the Lord, all the earth." - Psalm 96:1
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
