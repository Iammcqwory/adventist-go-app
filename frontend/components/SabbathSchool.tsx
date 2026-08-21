import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, Calendar, Users, Download, ChevronRight, Clock, Quote, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SabbathSchoolSkeleton, ListSkeleton } from './SkeletonLoader';
import backend from '~backend/client';

export function SabbathSchool() {
  const [selectedQuarter, setSelectedQuarter] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedDayStudy, setSelectedDayStudy] = useState<any>(null);

  const { data: quartersData, isLoading: quartersLoading, error: quartersError } = useQuery({
    queryKey: ['sabbath-school-quarters'],
    queryFn: () => backend.sabbath.getSabbathSchoolQuarters(),
  });

  const { data: currentLessonData, error: currentLessonError } = useQuery({
    queryKey: ['current-sabbath-school-lesson'],
    queryFn: () => backend.sabbath.getCurrentSabbathSchoolLesson(),
  });

  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useQuery({
    queryKey: ['sabbath-school-lessons', selectedQuarter?.id],
    queryFn: () => backend.sabbath.getSabbathSchoolLessons({ quarterId: selectedQuarter.id }),
    enabled: !!selectedQuarter,
  });

  const { data: dailyStudiesData, isLoading: dailyStudiesLoading, error: dailyStudiesError } = useQuery({
    queryKey: ['sabbath-school-daily-studies', selectedLesson?.id],
    queryFn: () => backend.sabbath.getSabbathSchoolDailyStudies({ lessonId: selectedLesson.id }),
    enabled: !!selectedLesson,
  });

  const quarters = quartersData?.quarters || [];
  const lessons = lessonsData?.lessons || [];
  const dailyStudies = dailyStudiesData?.dailyStudies || [];
  const currentLesson = currentLessonData?.currentLesson;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getQuarterName = (quarter: number) => {
    const names = ['', 'First', 'Second', 'Third', 'Fourth'];
    return names[quarter] || 'Unknown';
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  };

  const handleDownloadQuarter = (quarter: any) => {
    // In a real implementation, this would generate and download a PDF
    alert(`Downloading ${quarter.title} for offline study...`);
  };

  if (quartersLoading && !quartersData) {
    return <SabbathSchoolSkeleton />;
  }

  if (quartersError) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sabbath School</h1>
          <p className="text-slate-600 dark:text-gray-300">Study God's Word with the global Adventist family</p>
        </div>
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Book className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Sabbath School</h3>
              <p className="text-red-600 dark:text-red-400">There was an error loading the Sabbath School content. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Daily Study View
  if (selectedDayStudy) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDayStudy(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Lesson
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {getDayName(selectedDayStudy.dayOfWeek)}
          </Badge>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedDayStudy.title}
            </CardTitle>
            {selectedDayStudy.scriptureReferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDayStudy.scriptureReferences.map((ref: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                    {ref}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedDayStudy.content}
              </div>
            </div>

            {selectedDayStudy.discussionQuestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">Discussion Questions</h3>
                </div>
                <div className="space-y-3">
                  {selectedDayStudy.discussionQuestions.map((question: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-blue-600 dark:text-blue-400">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lesson View
  if (selectedLesson) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedLesson(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Quarter
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            Lesson {selectedLesson.lessonNumber}
          </Badge>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedLesson.title}
            </CardTitle>
            {selectedLesson.subtitle && (
              <p className="text-slate-600 dark:text-gray-300">{selectedLesson.subtitle}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Week of {formatDate(selectedLesson.dateFor)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedLesson.memoryVerse && (
              <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border-l-4 border-purple-400 dark:border-purple-600">
                <div className="flex items-center space-x-2 mb-2">
                  <Quote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Memory Verse</span>
                </div>
                <p className="text-purple-600 dark:text-purple-400 font-medium italic">
                  {selectedLesson.memoryVerse}
                </p>
              </div>
            )}

            {selectedLesson.introduction && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {selectedLesson.introduction}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Daily Studies</h3>
              {dailyStudiesLoading ? (
                <ListSkeleton count={7} />
              ) : dailyStudiesError ? (
                <div className="text-center py-8">
                  <Book className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">Error loading daily studies. Please try again.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyStudies.map((study) => (
                    <Card 
                      key={study.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                      onClick={() => setSelectedDayStudy(study)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              {getDayName(study.dayOfWeek)}: {study.title}
                            </h4>
                            {study.scriptureReferences.length > 0 && (
                              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                {study.scriptureReferences.join(', ')}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quarter View
  if (selectedQuarter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedQuarter(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Quarters
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownloadQuarter(selectedQuarter)}
            className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <Download className="w-4 h-4 mr-2" />
            Download for Offline
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedQuarter.title}
            </CardTitle>
            {selectedQuarter.subtitle && (
              <p className="text-slate-600 dark:text-gray-300">{selectedQuarter.subtitle}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400">
              <span>{getQuarterName(selectedQuarter.quarter)} Quarter {selectedQuarter.year}</span>
              <span>•</span>
              <span>{formatDate(selectedQuarter.startDate)} - {formatDate(selectedQuarter.endDate)}</span>
              {selectedQuarter.author && (
                <>
                  <span>•</span>
                  <span>By {selectedQuarter.author}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedQuarter.description && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-gray-200 leading-relaxed">
                  {selectedQuarter.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Lessons ({selectedQuarter.lessonsCount})
              </h3>
              {lessonsLoading ? (
                <ListSkeleton count={13} />
              ) : lessonsError ? (
                <div className="text-center py-8">
                  <Book className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">Error loading lessons. Please try again.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <Card 
                      key={lesson.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                                Lesson {lesson.lessonNumber}
                              </Badge>
                              <h4 className="font-semibold text-slate-800 dark:text-white">
                                {lesson.title}
                              </h4>
                            </div>
                            {lesson.subtitle && (
                              <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">{lesson.subtitle}</p>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Week of {formatDate(lesson.dateFor)}</span>
                              <span>•</span>
                              <span>{lesson.dailyStudiesCount} daily studies</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Quarters View
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sabbath School</h1>
        <p className="text-slate-600 dark:text-gray-300">Study God's Word with the global Adventist family</p>
      </div>

      {currentLesson && !currentLessonError && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-6 h-6" />
              <span>This Week's Lesson</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Lesson {currentLesson.lessonNumber}: {currentLesson.title}
              </h3>
              <p className="text-blue-600 dark:text-blue-400">{currentLesson.quarterTitle}</p>
            </div>
            
            {currentLesson.currentDayStudy && (
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Today's Study: {currentLesson.currentDayStudy.title}
                </h4>
                {currentLesson.currentDayStudy.scriptureReferences.length > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {currentLesson.currentDayStudy.scriptureReferences.join(', ')}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                // Find and select the current quarter
                const quarter = quarters.find(q => q.id === currentLesson.quarterId);
                if (quarter) {
                  setSelectedQuarter(quarter);
                  // Auto-select the current lesson
                  setTimeout(() => setSelectedLesson(currentLesson), 100);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Study This Week's Lesson
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Quarterly Study Guides</CardTitle>
        </CardHeader>
        <CardContent>
          {quarters.length === 0 ? (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-gray-400">No study guides available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {quarters.map((quarter) => (
                <Card 
                  key={quarter.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                  onClick={() => setSelectedQuarter(quarter)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                          {quarter.title}
                        </h3>
                        {quarter.subtitle && (
                          <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">{quarter.subtitle}</p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
                          <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                            Q{quarter.quarter} {quarter.year}
                          </Badge>
                          <span>{quarter.lessonsCount} lessons</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
                    </div>
                    
                    {quarter.author && (
                      <p className="text-xs text-slate-500 dark:text-gray-400">By {quarter.author}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Global Bible Study</h3>
          <p className="text-green-600 dark:text-green-400">
            Join millions of Adventists worldwide studying the same lessons each week.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
