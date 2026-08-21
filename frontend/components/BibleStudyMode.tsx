import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Book, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Highlighter, 
  MessageSquare, 
  Save, 
  X,
  Palette,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  SkipBack,
  SkipForward,
  Eye,
  EyeOff,
  Lightbulb,
  Quote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface BibleStudyModeProps {
  userId: string;
  initialBookId?: number;
  initialChapter?: number;
  onBack: () => void;
}

const highlightColors = [
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-800' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-200 dark:bg-blue-800' },
  { name: 'Green', value: 'green', class: 'bg-green-200 dark:bg-green-800' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-200 dark:bg-pink-800' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-200 dark:bg-purple-800' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-200 dark:bg-orange-800' },
];

export function BibleStudyMode({ userId, initialBookId = 1, initialChapter = 1, onBack }: BibleStudyModeProps) {
  const [selectedBookId, setSelectedBookId] = useState(initialBookId);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<{ verse: number; note: string } | null>(null);
  const [highlightingVerse, setHighlightingVerse] = useState<number | null>(null);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('yellow');
  const [showCommentary, setShowCommentary] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booksData } = useQuery({
    queryKey: ['bible-books'],
    queryFn: () => backend.sabbath.getBibleBooks(),
  });

  const { data: chapterData, isLoading: chapterLoading } = useQuery({
    queryKey: ['bible-chapter', selectedBookId, selectedChapter],
    queryFn: () => backend.sabbath.getBibleChapter({
      bookId: selectedBookId,
      chapter: selectedChapter,
    }),
  });

  const { data: verseNotesData } = useQuery({
    queryKey: ['bible-verse-notes', userId, selectedBookId, selectedChapter],
    queryFn: () => backend.sabbath.getBibleVerseNotes({
      userId,
      bookId: selectedBookId,
      chapter: selectedChapter,
    }),
  });

  const { data: commentaryData } = useQuery({
    queryKey: ['bible-commentary', selectedBookId, selectedChapter, selectedVerse],
    queryFn: () => backend.sabbath.getBibleCommentary({
      bookId: selectedBookId,
      chapter: selectedChapter,
      verse: selectedVerse || undefined,
    }),
    enabled: showCommentary,
  });

  const saveNoteMutation = useMutation({
    mutationFn: (data: any) => backend.sabbath.saveBibleVerseNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-verse-notes', userId, selectedBookId, selectedChapter] });
      setEditingNote(null);
      toast({
        title: 'Note saved',
        description: 'Your verse note has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to save note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const saveHighlightMutation = useMutation({
    mutationFn: (data: any) => backend.sabbath.saveBibleVerseNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-verse-notes', userId, selectedBookId, selectedChapter] });
      setHighlightingVerse(null);
      toast({
        title: 'Highlight saved',
        description: 'Your verse highlight has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to save highlight:', error);
      toast({
        title: 'Error',
        description: 'Failed to save highlight. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const books = booksData?.books || [];
  const verses = chapterData?.verses || [];
  const verseNotes = verseNotesData?.notes || [];
  const commentary = commentaryData?.commentary || [];

  const currentBook = books.find(book => book.id === selectedBookId);
  const currentBookName = currentBook?.name || '';
  const currentBookChapterCount = currentBook?.chapterCount || 1;

  const getVerseNote = (verseNumber: number) => {
    return verseNotes.find(note => note.verse === verseNumber);
  };

  const getHighlightClass = (color: string) => {
    const colorConfig = highlightColors.find(c => c.value === color);
    return colorConfig?.class || 'bg-yellow-200 dark:bg-yellow-800';
  };

  const handleSaveNote = () => {
    if (!editingNote) return;

    saveNoteMutation.mutate({
      userId,
      bookId: selectedBookId,
      chapter: selectedChapter,
      verse: editingNote.verse,
      note: editingNote.note,
    });
  };

  const handleHighlightVerse = (verseNumber: number, color: string) => {
    const existingNote = getVerseNote(verseNumber);
    
    saveHighlightMutation.mutate({
      userId,
      bookId: selectedBookId,
      chapter: selectedChapter,
      verse: verseNumber,
      note: existingNote?.note || '',
      isHighlighted: true,
      highlightColor: color,
    });
  };

  const handleRemoveHighlight = (verseNumber: number) => {
    const existingNote = getVerseNote(verseNumber);
    
    saveHighlightMutation.mutate({
      userId,
      bookId: selectedBookId,
      chapter: selectedChapter,
      verse: verseNumber,
      note: existingNote?.note || '',
      isHighlighted: false,
      highlightColor: null,
    });
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedChapter > 1) {
        setSelectedChapter(selectedChapter - 1);
      } else {
        // Go to previous book's last chapter
        const currentBookIndex = books.findIndex(book => book.id === selectedBookId);
        if (currentBookIndex > 0) {
          const prevBook = books[currentBookIndex - 1];
          setSelectedBookId(prevBook.id);
          setSelectedChapter(prevBook.chapterCount);
        }
      }
    } else {
      if (selectedChapter < currentBookChapterCount) {
        setSelectedChapter(selectedChapter + 1);
      } else {
        // Go to next book's first chapter
        const currentBookIndex = books.findIndex(book => book.id === selectedBookId);
        if (currentBookIndex < books.length - 1) {
          const nextBook = books[currentBookIndex + 1];
          setSelectedBookId(nextBook.id);
          setSelectedChapter(1);
        }
      }
    }
    setSelectedVerse(null);
  };

  const navigateVerse = (direction: 'prev' | 'next') => {
    if (!selectedVerse) {
      setSelectedVerse(direction === 'next' ? 1 : verses.length);
      return;
    }

    if (direction === 'prev') {
      if (selectedVerse > 1) {
        setSelectedVerse(selectedVerse - 1);
      } else {
        // Go to previous chapter's last verse
        navigateChapter('prev');
        // Will need to wait for chapter to load to set last verse
        setTimeout(() => setSelectedVerse(null), 100);
      }
    } else {
      if (selectedVerse < verses.length) {
        setSelectedVerse(selectedVerse + 1);
      } else {
        // Go to next chapter's first verse
        navigateChapter('next');
        setTimeout(() => setSelectedVerse(1), 100);
      }
    }
  };

  useEffect(() => {
    setSelectedVerse(null);
  }, [selectedBookId, selectedChapter]);

  if (chapterLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Bible
          </Button>
        </div>
        <div className="text-center py-12">
          <Book className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 dark:text-gray-400">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Bible
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            Study Mode
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showNotes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Notes
          </Button>
          <Button
            variant={showHighlights ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHighlights(!showHighlights)}
          >
            <Highlighter className="w-4 h-4 mr-1" />
            Highlights
          </Button>
          <Button
            variant={showCommentary ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCommentary(!showCommentary)}
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Commentary
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedBookId.toString()} onValueChange={(value) => {
                setSelectedBookId(parseInt(value));
                setSelectedChapter(1);
              }}>
                <SelectTrigger className="w-48 bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedChapter.toString()} onValueChange={(value) => setSelectedChapter(parseInt(value))}>
                <SelectTrigger className="w-32 bg-white dark:bg-black border-slate-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: currentBookChapterCount }, (_, i) => i + 1).map((chapter) => (
                    <SelectItem key={chapter} value={chapter.toString()}>
                      Chapter {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('prev')}
                disabled={selectedBookId === 1 && selectedChapter === 1}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateVerse('prev')}
                disabled={!selectedVerse}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateVerse('next')}
                disabled={!selectedVerse}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('next')}
                disabled={selectedBookId === books[books.length - 1]?.id && selectedChapter === currentBookChapterCount}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bible Text */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800 dark:text-white">
                {currentBookName} {selectedChapter}
              </CardTitle>
              <p className="text-slate-600 dark:text-gray-300">
                {chapterData?.translationAbbreviation || 'KJV'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {verses.map((verse) => {
                const verseNote = getVerseNote(verse.verse);
                const isSelected = selectedVerse === verse.verse;
                const isHighlighted = showHighlights && verseNote?.isHighlighted;
                const highlightClass = isHighlighted ? getHighlightClass(verseNote?.highlightColor || 'yellow') : '';

                return (
                  <div
                    key={verse.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/50' 
                        : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                    } ${highlightClass}`}
                    onClick={() => setSelectedVerse(verse.verse)}
                  >
                    <div className="flex items-start space-x-3">
                      <Badge 
                        variant="outline" 
                        className="mt-1 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 font-mono"
                      >
                        {verse.verse}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-slate-700 dark:text-gray-200 leading-relaxed">
                          {verse.text}
                        </p>
                        
                        {showNotes && verseNote?.note && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/50 rounded border-l-2 border-blue-400 dark:border-blue-600">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              {verseNote.note}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Verse Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote({ verse: verse.verse, note: verseNote?.note || '' });
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        
                        {isHighlighted ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveHighlight(verse.verse);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <EyeOff className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHighlightingVerse(verse.verse);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Highlighter className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Verse Info */}
          {selectedVerse && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">
                  {currentBookName} {selectedChapter}:{selectedVerse}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Selected verse for detailed study
                </p>
              </CardContent>
            </Card>
          )}

          {/* Commentary */}
          {showCommentary && commentary.length > 0 && (
            <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span>Commentary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commentary.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-yellow-400 dark:border-yellow-600 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300">
                        {entry.commentaryType}
                      </Badge>
                      {entry.verse && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                          v.{entry.verse}
                        </Badge>
                      )}
                    </div>
                    {entry.title && (
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                        {entry.title}
                      </h4>
                    )}
                    <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                      {entry.content}
                    </p>
                    {entry.author && (
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                        — {entry.author}
                        {entry.source && `, ${entry.source}`}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Study Notes Summary */}
          {showNotes && verseNotes.length > 0 && (
            <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Chapter Notes ({verseNotes.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {verseNotes.filter(note => note.note.trim()).map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                        v.{note.verse}
                      </Badge>
                      {note.isHighlighted && (
                        <div className={`w-3 h-3 rounded-full ${getHighlightClass(note.highlightColor || 'yellow')}`} />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      {note.note}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Note Editing Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
                <span>Edit Note - Verse {editingNote.verse}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNote(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editingNote.note}
                onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                placeholder="Add your personal note for this verse..."
                rows={4}
                className="bg-white dark:bg-black border-slate-300 dark:border-gray-600"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveNote}
                  disabled={saveNoteMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                </Button>
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Highlight Color Picker */}
      {highlightingVerse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
                <span>Highlight Verse {highlightingVerse}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHighlightingVerse(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {highlightColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    className={`h-12 ${color.class} border-2 ${
                      selectedHighlightColor === color.value 
                        ? 'border-slate-800 dark:border-white' 
                        : 'border-slate-300 dark:border-gray-600'
                    }`}
                    onClick={() => setSelectedHighlightColor(color.value)}
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-white">
                      {color.name}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleHighlightVerse(highlightingVerse, selectedHighlightColor);
                  }}
                  disabled={saveHighlightMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Highlighter className="w-4 h-4 mr-2" />
                  {saveHighlightMutation.isPending ? 'Highlighting...' : 'Highlight Verse'}
                </Button>
                <Button variant="outline" onClick={() => setHighlightingVerse(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
