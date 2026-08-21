import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Book, 
  Search, 
  Bookmark, 
  BookmarkPlus, 
  ExternalLink, 
  Filter, 
  Tag,
  ChevronRight,
  ChevronDown,
  Copy,
  Share,
  Heart,
  X,
  Zap,
  Quote,
  Target,
  BookOpen,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BibleLookupSkeleton, ListSkeleton } from './SkeletonLoader';
import { BibleStudyMode } from './BibleStudyMode';
import backend from '~backend/client';

interface BibleLookupProps {
  userId: string;
}

export function BibleLookup({ userId }: BibleLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'keyword' | 'phrase' | 'topic'>('keyword');
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedTestament, setSelectedTestament] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<any>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [studyModeBook, setStudyModeBook] = useState<number>(1);
  const [studyModeChapter, setStudyModeChapter] = useState<number>(1);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkTags, setBookmarkTags] = useState('');
  const [expandedCrossRefs, setExpandedCrossRefs] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showSearchHelp, setShowSearchHelp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageSize = 20;

  const { data: translationsData } = useQuery({
    queryKey: ['bible-translations'],
    queryFn: () => backend.sabbath.getBibleTranslations(),
  });

  const { data: booksData } = useQuery({
    queryKey: ['bible-books'],
    queryFn: () => backend.sabbath.getBibleBooks(),
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['bible-search', searchQuery, searchType, selectedTranslation, selectedBook, selectedTestament, currentPage],
    queryFn: () => backend.sabbath.searchBibleVerses({
      query: searchQuery,
      searchType,
      translationId: selectedTranslation || undefined,
      bookId: selectedBook || undefined,
      testament: selectedTestament === 'all' ? undefined : selectedTestament,
      limit: pageSize,
      offset: currentPage * pageSize,
    }),
    enabled: !!searchQuery.trim(),
  });

  const { data: crossReferencesData } = useQuery({
    queryKey: ['bible-cross-references', selectedVerse?.bookId, selectedVerse?.chapter, selectedVerse?.verse],
    queryFn: () => backend.sabbath.getBibleCrossReferences({
      bookId: selectedVerse.bookId,
      chapter: selectedVerse.chapter,
      verse: selectedVerse.verse,
    }),
    enabled: !!selectedVerse,
  });

  const { data: bookmarksData } = useQuery({
    queryKey: ['bible-bookmarks', userId, selectedTag],
    queryFn: () => backend.sabbath.getBibleBookmarks({
      userId,
      tag: selectedTag === 'all' ? undefined : selectedTag,
    }),
    enabled: showBookmarks,
  });

  const saveBookmarkMutation = useMutation({
    mutationFn: (bookmark: any) => backend.sabbath.saveBibleBookmark(bookmark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-bookmarks', userId] });
      setBookmarkNote('');
      setBookmarkTags('');
      toast({
        title: 'Bookmark saved',
        description: 'Verse has been added to your bookmarks.',
      });
    },
    onError: (error) => {
      console.error('Failed to save bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to save bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => backend.sabbath.deleteBibleBookmark({
      userId,
      bookmarkId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-bookmarks', userId] });
      toast({
        title: 'Bookmark removed',
        description: 'Verse has been removed from your bookmarks.',
      });
    },
    onError: (error) => {
      console.error('Failed to delete bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const translations = translationsData?.translations || [];
  const books = booksData?.books || [];
  const verses = searchResults?.verses || [];
  const totalVerses = searchResults?.total || 0;
  const crossReferences = crossReferencesData?.crossReferences || [];
  const bookmarks = bookmarksData?.bookmarks || [];
  const totalPages = Math.ceil(totalVerses / pageSize);
  const suggestions = searchResults?.suggestions || [];

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  const handleSearchTypeChange = (type: 'keyword' | 'phrase' | 'topic') => {
    setSearchType(type);
    setCurrentPage(0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setCurrentPage(0);
  };

  const handleSaveBookmark = () => {
    if (!selectedVerse) return;

    const tags = bookmarkTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    saveBookmarkMutation.mutate({
      userId,
      bookId: selectedVerse.bookId,
      chapter: selectedVerse.chapter,
      verse: selectedVerse.verse,
      note: bookmarkNote || undefined,
      tags,
    });
  };

  const handleCopyVerse = (verse: any) => {
    const text = `"${verse.text}" - ${verse.reference} (${verse.translationAbbreviation})`;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Verse has been copied to your clipboard.',
    });
  };

  const handleShareVerse = (verse: any) => {
    if (navigator.share) {
      navigator.share({
        title: verse.reference,
        text: `"${verse.text}" - ${verse.reference} (${verse.translationAbbreviation})`,
      });
    } else {
      handleCopyVerse(verse);
    }
  };

  const handleOpenStudyMode = (bookId?: number, chapter?: number) => {
    if (bookId && chapter) {
      setStudyModeBook(bookId);
      setStudyModeChapter(chapter);
    }
    setShowStudyMode(true);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'phrase':
        return Quote;
      case 'topic':
        return Target;
      default:
        return Search;
    }
  };

  const getSearchTypeDescription = (type: string) => {
    switch (type) {
      case 'phrase':
        return 'Search for exact phrases in quotes';
      case 'topic':
        return 'Search by topics with related terms';
      default:
        return 'Search by individual keywords';
    }
  };

  const renderVerseText = (verse: any) => {
    if (verse.headline && searchResults?.searchType !== 'fallback') {
      // Use highlighted headline from full-text search
      return (
        <div 
          className="text-slate-700 dark:text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: verse.headline }}
        />
      );
    }
    return (
      <p className="text-slate-700 dark:text-gray-200 leading-relaxed">
        "{verse.text}"
      </p>
    );
  };

  if (showStudyMode) {
    return (
      <BibleStudyMode
        userId={userId}
        initialBookId={studyModeBook}
        initialChapter={studyModeChapter}
        onBack={() => setShowStudyMode(false)}
      />
    );
  }

  if (showBookmarks) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setShowBookmarks(false)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Search
          </Button>
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-48 bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {getAllTags().map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
              <Bookmark className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span>My Bookmarks ({bookmarks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-gray-400">
                  {selectedTag === 'all' 
                    ? 'No bookmarks yet. Search for verses and bookmark your favorites!' 
                    : `No bookmarks found with the tag "${selectedTag}".`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <Card 
                    key={bookmark.id}
                    className="border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                            {bookmark.reference}
                          </h3>
                          {bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {bookmark.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBookmarkMutation.mutate(bookmark.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {bookmark.note && (
                        <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                          <p className="text-sm text-slate-600 dark:text-gray-300">{bookmark.note}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-500 dark:text-gray-400">
                        Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedVerse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedVerse(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Search
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {selectedVerse.translationAbbreviation}
          </Badge>
          {selectedVerse.rank && (
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              <Zap className="w-3 h-3 mr-1" />
              Relevance: {Math.round(selectedVerse.rank * 100)}%
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenStudyMode(selectedVerse.bookId, selectedVerse.chapter)}
            className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <Eye className="w-4 h-4 mr-2" />
            Study Mode
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedVerse.reference}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
              {renderVerseText(selectedVerse)}
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                — {selectedVerse.reference} ({selectedVerse.translationAbbreviation})
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyVerse(selectedVerse)}
                className="text-slate-600 dark:text-gray-300"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShareVerse(selectedVerse)}
                className="text-slate-600 dark:text-gray-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenStudyMode(selectedVerse.bookId, selectedVerse.chapter)}
                className="text-green-600 dark:text-green-400"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Study Chapter
              </Button>
            </div>

            {crossReferences.length > 0 && (
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setExpandedCrossRefs(!expandedCrossRefs)}
                  className="flex items-center space-x-2 p-0 h-auto text-slate-700 dark:text-gray-200"
                >
                  {expandedCrossRefs ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-semibold">Cross References ({crossReferences.length})</span>
                </Button>
                
                {expandedCrossRefs && (
                  <div className="mt-3 space-y-2">
                    {crossReferences.map((ref) => (
                      <div key={ref.id} className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {ref.reference}
                        </span>
                        <Badge variant="outline" className="text-xs border-slate-300 dark:border-gray-600 text-slate-600 dark:text-gray-300">
                          {ref.referenceType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-3">
                <BookmarkPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">Add to Bookmarks</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Note (optional)
                  </label>
                  <Textarea
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    placeholder="Add a personal note about this verse..."
                    rows={3}
                    className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={bookmarkTags}
                    onChange={(e) => setBookmarkTags(e.target.value)}
                    placeholder="e.g., faith, hope, prayer"
                    className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
                  />
                </div>
                
                <Button
                  onClick={handleSaveBookmark}
                  disabled={saveBookmarkMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {saveBookmarkMutation.isPending ? 'Saving...' : 'Save Bookmark'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Bible Lookup</h1>
        <p className="text-slate-600 dark:text-gray-300">Search Scripture with advanced full-text search capabilities</p>
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-white">
                  Scripture Search
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-gray-400">Search keywords, topics, or exact phrases across the Bible</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenStudyMode()}
                className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950 text-xs font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                Study Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBookmarks(true)}
                className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950 text-xs font-semibold"
              >
                <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                Bookmarks
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          {/* Primary Search Bar */}
          <div className="space-y-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 text-slate-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search Bible e.g., 'Sabbath rest', 'Sanctuary', 'John 3:16'..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-24 py-5 bg-white dark:bg-gray-900 border-slate-300 dark:border-gray-700 rounded-xl text-sm font-medium focus-visible:ring-blue-500"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-8 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                    showFilters 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 dark:text-gray-300'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {(selectedTranslation || selectedBook || selectedTestament !== 'all') && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Search Type selector pills */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-slate-500 dark:text-gray-400 font-medium mr-1">Match:</span>
                {(['keyword', 'phrase', 'topic'] as const).map((type) => {
                  const Icon = getSearchTypeIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleSearchTypeChange(type)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                        searchType === type
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>

              {(selectedTranslation || selectedBook || selectedTestament !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedTranslation(null);
                    setSelectedBook(null);
                    setSelectedTestament('all');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Search Filters Disclosure */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Refine Search Scope
                </span>
                <span className="text-[11px] text-slate-400">
                  Selecting a Testament automatically updates available Books
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    Translation
                  </label>
                  <Select 
                    value={selectedTranslation?.toString() || 'default'} 
                    onValueChange={(value) => setSelectedTranslation(value === 'default' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-700 text-xs">
                      <SelectValue placeholder="Select translation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (King James Version)</SelectItem>
                      {translations.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.abbreviation} - {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    Testament
                  </label>
                  <Select value={selectedTestament} onValueChange={(val) => {
                    setSelectedTestament(val);
                    setSelectedBook(null);
                  }}>
                    <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-700 text-xs">
                      <SelectValue placeholder="Select testament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Entire Bible (Old & New)</SelectItem>
                      <SelectItem value="old">Old Testament (Genesis - Malachi)</SelectItem>
                      <SelectItem value="new">New Testament (Matthew - Revelation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    Specific Book
                  </label>
                  <Select 
                    value={selectedBook?.toString() || 'all'} 
                    onValueChange={(value) => setSelectedBook(value === 'all' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-700 text-xs">
                      <SelectValue placeholder="All Books" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Books</SelectItem>
                      {selectedTestament !== 'new' && oldTestamentBooks.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name} (OT)
                        </SelectItem>
                      ))}
                      {selectedTestament !== 'old' && newTestamentBooks.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name} (NT)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Contextual Topic Suggestions (When empty) */}
          {!searchQuery && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Curated Adventist Study Topics:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Creation & Eden',
                  'Sabbath Rest',
                  'Sanctuary in Heaven',
                  'Second Coming of Christ',
                  'Grace & Faith',
                  'Three Angels Messages',
                  'Peace in Troubled Times',
                  'Daniel 8:14'
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleSearch(topic)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-medium border border-slate-200 dark:border-gray-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {searchQuery && (
        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
              <div className="flex items-center space-x-2">
                <span>Search Results ({totalVerses} verses found)</span>
                {searchResults?.searchType && (
                  <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                    {searchResults.searchType === 'fallback' ? 'Basic Search' : `${searchType} search`}
                  </Badge>
                )}
              </div>
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
            {searchLoading ? (
              <ListSkeleton count={5} />
            ) : verses.length === 0 ? (
              <div className="text-center py-8">
                <Book className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-gray-400 mb-4">
                  No verses found matching your search criteria.
                </p>
                {suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">Try these popular searches:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {verses.map((verse) => (
                  <Card 
                    key={verse.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                    onClick={() => setSelectedVerse(verse)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                              {verse.reference}
                            </h3>
                            <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                              {verse.translationAbbreviation}
                            </Badge>
                            {verse.rank && (
                              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                <Zap className="w-3 h-3 mr-1" />
                                {Math.round(verse.rank * 100)}%
                              </Badge>
                            )}
                          </div>
                          {renderVerseText(verse)}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudyMode(verse.bookId, verse.chapter);
                            }}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyVerse(verse);
                            }}
                            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!searchQuery && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="text-center py-8">
            <Book className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Explore God's Word</h3>
            <p className="text-blue-600 dark:text-blue-400 mb-4">
              Search the Scriptures with powerful full-text search, discover cross-references, and build your personal study collection.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Smart Search</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Advanced full-text search with relevance ranking</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Topic Search</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Find verses by topics with related terms</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Study Mode</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Verse-by-verse study with notes and highlights</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Bookmark className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Bookmark Favorites</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Save verses for Sabbath study</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
