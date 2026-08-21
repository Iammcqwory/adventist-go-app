import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Star, BookOpen, Music, Lightbulb, Trophy, Mic, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const worshipIdeas = [
  {
    category: 'Children',
    icon: Heart,
    color: 'pink',
    activities: [
      {
        title: 'Sabbath Story Time',
        description: 'Read Bible stories with interactive elements and simple lessons.',
        ageGroup: '3-8 years',
        duration: '15-20 minutes',
      },
      {
        title: 'Nature Walk & Creation Talk',
        description: 'Explore God\'s creation and discuss the beauty of His handiwork.',
        ageGroup: '5-12 years',
        duration: '30-45 minutes',
      },
      {
        title: 'Sabbath Craft Corner',
        description: 'Simple crafts that reinforce Bible lessons and Sabbath themes.',
        ageGroup: '4-10 years',
        duration: '20-30 minutes',
      },
    ],
  },
  {
    category: 'Youth',
    icon: Star,
    color: 'blue',
    activities: [
      {
        title: 'Deep Dive Bible Study',
        description: 'Explore challenging questions and contemporary applications of Scripture.',
        ageGroup: '13-18 years',
        duration: '45-60 minutes',
      },
      {
        title: 'Service Planning Session',
        description: 'Plan community service projects and mission activities.',
        ageGroup: '12-18 years',
        duration: '30-45 minutes',
      },
      {
        title: 'Faith & Life Discussions',
        description: 'Open discussions about faith, purpose, and life decisions.',
        ageGroup: '15-18 years',
        duration: '30-60 minutes',
      },
    ],
  },
  {
    category: 'Family',
    icon: Users,
    color: 'green',
    activities: [
      {
        title: 'Family Testimony Time',
        description: 'Share blessings, answered prayers, and God\'s goodness.',
        ageGroup: 'All ages',
        duration: '20-30 minutes',
      },
      {
        title: 'Hymn Sing & Worship',
        description: 'Sing favorite hymns and worship songs together.',
        ageGroup: 'All ages',
        duration: '30-45 minutes',
      },
      {
        title: 'Scripture Memory Challenge',
        description: 'Learn and recite Bible verses as a family.',
        ageGroup: 'All ages',
        duration: '15-25 minutes',
      },
    ],
  },
];

const worshipTemplates = [
  {
    title: 'Traditional Family Worship',
    duration: '60 minutes',
    structure: [
      'Opening Prayer (5 min)',
      'Hymn Singing (10 min)',
      'Bible Reading (15 min)',
      'Discussion & Sharing (20 min)',
      'Prayer Requests (5 min)',
      'Closing Prayer (5 min)',
    ],
  },
  {
    title: 'Interactive Children\'s Worship',
    duration: '45 minutes',
    structure: [
      'Welcome Song (5 min)',
      'Bible Story with Actions (15 min)',
      'Memory Verse Game (10 min)',
      'Craft or Activity (10 min)',
      'Closing Circle & Prayer (5 min)',
    ],
  },
  {
    title: 'Youth-Led Worship',
    duration: '75 minutes',
    structure: [
      'Contemporary Worship Music (15 min)',
      'Icebreaker Activity (10 min)',
      'Bible Study Discussion (30 min)',
      'Personal Reflection Time (10 min)',
      'Group Prayer & Sharing (10 min)',
    ],
  },
];

export function FamilyWorship() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const getColorClasses = (color: string) => {
    const colors = {
      pink: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
      blue: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Templates
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              {selectedTemplate.title}
            </CardTitle>
            <Badge variant="secondary" className="w-fit bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
              {selectedTemplate.duration}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-3">Worship Structure:</h3>
              <div className="space-y-3">
                {selectedTemplate.structure.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 dark:text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCategory) {
    const category = worshipIdeas.find(cat => cat.category === selectedCategory);
    if (!category) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            ← Back to Categories
          </Button>
          <Badge variant="secondary" className={getColorClasses(category.color)}>
            {category.category} Activities
          </Badge>
        </div>

        <div className="space-y-4">
          {category.activities.map((activity, index) => (
            <Card key={index} className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-white">
                  {activity.title}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">{activity.ageGroup}</Badge>
                  <Badge variant="outline" className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">{activity.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-gray-300">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Family & Group Worship</h1>
        <p className="text-slate-600 dark:text-gray-300">Meaningful worship experiences for every age</p>
      </div>

      {/* Adventist Kids Go - Verse Master Featured Card */}
      <Link to="/verse-master" className="block group">
        <Card className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Mic className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-400 text-amber-950 font-black text-[10px] tracking-wider uppercase">
                    Kids & Family Challenge
                  </Badge>
                  <span className="text-xs text-indigo-200 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Earn Sabbath Coins
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1 group-hover:text-amber-200 transition-colors">
                  Verse Master: Voice Recitation Challenge
                </h2>
                <p className="text-xs text-indigo-100 mt-0.5 max-w-xl">
                  Test your Scripture memory with hands-free speech recognition or word puzzles! Perfect for Friday evening family worship.
                </p>
              </div>
            </div>
            <Button className="bg-white text-indigo-950 hover:bg-amber-300 hover:text-indigo-950 font-bold rounded-xl text-xs px-5 py-2.5 shadow-md flex items-center gap-2 flex-shrink-0">
              <span>Start Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {worshipIdeas.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.category}
              className={`cursor-pointer hover:shadow-lg transition-all ${getColorClasses(category.color)} border-2`}
              onClick={() => setSelectedCategory(category.category)}
            >
              <CardHeader className="text-center">
                <Icon className="w-12 h-12 mx-auto mb-4" />
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm opacity-80">
                  {category.activities.length} activities available
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Worship Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {worshipTemplates.map((template, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                    {template.title}
                  </h3>
                  <Badge variant="outline" className="mb-3 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200">
                    {template.duration}
                  </Badge>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    {template.structure.length} step structure
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
        <CardContent className="text-center py-8">
          <Music className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">Worship Together</h3>
          <p className="text-purple-600 dark:text-purple-400">
            "Train up a child in the way he should go, and when he is old he will not depart from it." - Proverbs 22:6
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
