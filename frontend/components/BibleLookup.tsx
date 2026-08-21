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

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
            <div className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Advanced Scripture Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleOpenStudyMode()}
                className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Study Mode
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchHelp(!showSearchHelp)}
                className="text-slate-500 dark:text-gray-400"
              >
                ?
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBookmarks(true)}
                className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                My Bookmarks
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSearchHelp && (
            <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Search Help</h3>
              <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <div><strong>Keyword:</strong> Search for individual words (e.g., "love faith hope")</div>
                <div><strong>Phrase:</strong> Search for exact phrases (e.g., "love your neighbor")</div>
                <div><strong>Topic:</strong> Search by topics with related terms (e.g., "salvation" finds "save", "savior", "redeem")</div>
                <div><strong>Study Mode:</strong> Navigate verse-by-verse with notes, highlights, and commentary</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Search Type:</span>
              <div className="flex space-x-1">
                {(['keyword', 'phrase', 'topic'] as const).map((type) => {
                  const Icon = getSearchTypeIcon(type);
                  return (
                    <Button
                      key={type}
                      variant={searchType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSearchTypeChange(type)}
                      className={searchType === type ? 'bg-blue-600 text-white' : ''}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder={`${getSearchTypeDescription(searchType)}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-black border-slate-300 dark:border-gray-600"
              />
            </div>

            {suggestions.length > 0 && !searchQuery && (
              <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Translation
              </label>
              <Select value={selectedTranslation?.toString() || 'default'} onValueChange={(value) => setSelectedTranslation(value === 'default' ? null : parseInt(value))}>
                <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="Select translation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (KJV)</SelectItem>
                  {translations.map((translation) => (
                    <SelectItem key={translation.id} value={translation.id.toString()}>
                      {translation.abbreviation} - {translation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Testament
              </label>
              <Select value={selectedTestament} onValueChange={setSelectedTestament}>
                <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="Select testament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Books</SelectItem>
                  <SelectItem value="old">Old Testament</SelectItem>
                  <SelectItem value="new">New Testament</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Book
              </label>
              <Select value={selectedBook?.toString() || 'all'} onValueChange={(value) => setSelectedBook(value === 'all' ? null : parseInt(value))}>
                <SelectTrigger className="bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Books</SelectItem>
                  {selectedTestament !== 'new' && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-gray-400">Old Testament</div>
                      {oldTestamentBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {selectedTestament !== 'old' && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-gray-400">New Testament</div>
                      {newTestamentBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTranslation(null);
                  setSelectedBook(null);
                  setSelectedTestament('all');
                  setCurrentPage(0);
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
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
