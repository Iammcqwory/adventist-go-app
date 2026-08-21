import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Music, 
  Compass, 
  Sun, 
  Heart, 
  Star, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Award, 
  ShieldCheck, 
  Smile, 
  Trees, 
  Bird, 
  Flower2, 
  CloudSun, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Story {
  id: string;
  title: string;
  emoji: string;
  verse: string;
  reference: string;
  summary: string;
  takeaway: string;
  bgGradient: string;
}

const BIBLE_STORIES: Story[] = [
  {
    id: 'creation',
    title: 'The 7 Days of Creation',
    emoji: '🌍',
    verse: 'And on the seventh day God ended His work which He had done, and He rested on the seventh day.',
    reference: 'Genesis 2:2',
    summary: 'God spoke, and light appeared! He created the oceans, sky, plants, sun, moon, stars, animals, and Adam & Eve. On the 7th day, He made the holy Sabbath as a special birthday gift for the whole world!',
    takeaway: 'God made you with love, and the Sabbath is a special day to celebrate His wonderful world.',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-blue-500/20',
  },
  {
    id: 'noah',
    title: "Noah & The Great Ark",
    emoji: '🚢',
    verse: 'I set My rainbow in the cloud, and it shall be for the sign of the covenant between Me and the earth.',
    reference: 'Genesis 9:13',
    summary: 'Noah listened to God when no one else would. He built a giant ark, brought animals two by two, and God kept them safe inside through the great storm. After the rain, God painted the very first rainbow in the sky!',
    takeaway: 'God always keeps His promises to you, no matter how big the storm feels.',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-cyan-500/20',
  },
  {
    id: 'david',
    title: 'David & Giant Goliath',
    emoji: '🏹',
    verse: 'The battle is the Lord’s, and He will give you into our hands.',
    reference: '1 Samuel 17:47',
    summary: 'Young shepherd boy David knew God was bigger than any giant. Armed only with faith, a sling, and five smooth stones, David stood brave for God and defeated giant Goliath in front of both armies!',
    takeaway: 'You don’t have to be big to do big things for God. Trust Him with all your heart!',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-red-500/20',
  },
  {
    id: 'daniel',
    title: 'Daniel in the Lions’ Den',
    emoji: '🦁',
    verse: 'My God sent His angel and shut the lions’ mouths, so that they have not hurt me.',
    reference: 'Daniel 6:22',
    summary: 'Daniel loved God so much that he prayed three times every single day by his window. Even when thrown into a dark den with hungry lions, God sent a mighty angel to close the lions’ mouths all night long!',
    takeaway: 'Never be afraid to pray. God watches over you wherever you go.',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-indigo-500/20',
  },
  {
    id: 'jesus-storm',
    title: 'Jesus Calms the Storm',
    emoji: '🌊',
    verse: 'Peace, be still! And the wind ceased and there was a great calm.',
    reference: 'Mark 4:39',
    summary: 'While crossing the Sea of Galilee, a giant tempest rocked the disciples’ boat with huge waves. The disciples woke Jesus, and with just three words—"Peace, be still"—the raging winds and sea turned completely calm!',
    takeaway: 'When you feel scared, call on Jesus. He has the power to bring peace to your heart.',
    bgGradient: 'from-sky-500/20 via-blue-500/10 to-indigo-500/20',
  },
];

interface KidsSong {
  title: string;
  emoji: string;
  theme: string;
  lyrics: string[];
}

const KIDS_SONGS: KidsSong[] = [
  {
    title: 'Jesus Loves Me',
    emoji: '❤️',
    theme: 'God’s Love',
    lyrics: [
      'Jesus loves me! This I know,',
      'For the Bible tells me so.',
      'Little ones to Him belong;',
      'They are weak, but He is strong.',
      '',
      'Yes, Jesus loves me! Yes, Jesus loves me!',
      'Yes, Jesus loves me! The Bible tells me so.',
    ],
  },
  {
    title: 'This Little Light of Mine',
    emoji: '🕯️',
    theme: 'Sharing the Gospel',
    lyrics: [
      'This little light of mine, I’m gonna let it shine!',
      'This little light of mine, I’m gonna let it shine!',
      'This little light of mine, I’m gonna let it shine!',
      'Let it shine, let it shine, let it shine!',
      '',
      'Hide it under a bushel? NO! I’m gonna let it shine!',
      'Won’t let Satan blow it out, I’m gonna let it shine!',
    ],
  },
  {
    title: 'I’ve Got the Joy, Joy, Joy',
    emoji: '✨',
    theme: 'Sabbath Joy',
    lyrics: [
      'I’ve got the joy, joy, joy, joy down in my heart!',
      'Where? Down in my heart!',
      'Where? Down in my heart!',
      'I’ve got the joy, joy, joy, joy down in my heart!',
      'Down in my heart to stay!',
      '',
      'And I’m so happy, so very happy,',
      'I have the love of Jesus in my heart!',
    ],
  },
  {
    title: 'The Wise Man Built His House',
    emoji: '🏠',
    theme: 'Building on Jesus',
    lyrics: [
      'The wise man built his house upon the Rock,',
      'The wise man built his house upon the Rock,',
      'The wise man built his house upon the Rock,',
      'And the rains came tumbling down!',
      '',
      'The rains came down and the floods came up,',
      'And the house on the Rock stood FIRM!',
    ],
  },
];

interface ScavengerItem {
  id: number;
  label: string;
  icon: any;
  hint: string;
}

const NATURE_ITEMS: ScavengerItem[] = [
  { id: 1, label: 'Find a unique leaf shape', icon: Trees, hint: 'Notice the intricate veins God designed on each leaf!' },
  { id: 2, label: 'Listen for bird songs', icon: Bird, hint: 'How many different bird melodies can you hear?' },
  { id: 3, label: 'Spot a colorful flower', icon: Flower2, hint: 'Admire the vibrant petals God painted for you.' },
  { id: 4, label: 'Watch the clouds float', icon: CloudSun, hint: 'Imagine Jesus returning in glory with the angels.' },
  { id: 5, label: 'Find a smooth pebble or stone', icon: Compass, hint: 'Remember the 5 smooth stones David used in faith!' },
  { id: 6, label: 'Feel the warm sunlight or gentle breeze', icon: Sun, hint: 'Thank Jesus for creating the warmth of the sun.' },
];

export function KidsMode() {
  const [activeTab, setActiveTab] = useState<'stories' | 'songs' | 'nature' | 'games'>('stories');
  const [selectedStory, setSelectedStory] = useState<Story>(BIBLE_STORIES[0]);
  const [selectedSong, setSelectedSong] = useState<KidsSong>(KIDS_SONGS[0]);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [checkedNature, setCheckedNature] = useState<Record<number, boolean>>({});
  const [stars, setStars] = useState<number>(() => {
    return parseInt(localStorage.getItem('adventist_kids_stars') || '25', 10);
  });

  const { toast } = useToast();

  const handleToggleNature = (id: number) => {
    const next = !checkedNature[id];
    setCheckedNature((prev) => ({ ...prev, [id]: next }));
    if (next) {
      const newStars = stars + 10;
      setStars(newStars);
      localStorage.setItem('adventist_kids_stars', newStars.toString());
      playChime();
      toast({
        title: '🌟 Star Earned!',
        description: '+10 Stars added to your Sabbath Explorer badge!',
      });
    }
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  };

  const completedCount = Object.values(checkedNature).filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-12">
      {/* Kids Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Adventist Kids Go • Sanctuary Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Sabbath Adventures & Joy! 🎈
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-md font-medium">
              Explore God’s word, sing favorite songs, collect discovery stars, and master memory verses!
            </p>
          </div>

          {/* Star Counter Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-white/20 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-2xl border border-white/30 shadow-lg self-start sm:self-auto">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-950" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-100 tracking-wider">Explorer Stars</p>
              <p className="text-lg sm:text-xl font-black">{stars} ⭐</p>
            </div>
          </div>
        </div>

        {/* Playful background circles */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('stories')}
          className={`p-3 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm min-h-[44px] ${
            activeTab === 'stories'
              ? 'bg-blue-600 text-white shadow-blue-500/30 scale-[1.02]'
              : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bible Stories</span>
        </button>

        <button
          onClick={() => setActiveTab('songs')}
          className={`p-3 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm min-h-[44px] ${
            activeTab === 'songs'
              ? 'bg-purple-600 text-white shadow-purple-500/30 scale-[1.02]'
              : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Sing-Along</span>
        </button>

        <button
          onClick={() => setActiveTab('nature')}
          className={`p-3 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm min-h-[44px] ${
            activeTab === 'nature'
              ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-[1.02]'
              : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800'
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>Nature Hunt</span>
        </button>

        <Link to="/verse-master" className="w-full">
          <button
            className="w-full p-3 sm:p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/30 hover:scale-[1.02] min-h-[44px]"
          >
            <Trophy className="w-4 h-4" />
            <span>Verse Master 🎙️</span>
          </button>
        </Link>
      </div>

      {/* 1. BIBLE STORIES TAB */}
      {activeTab === 'stories' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {/* Stories Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {BIBLE_STORIES.map((story) => (
              <button
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all min-h-[44px] ${
                  selectedStory.id === story.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-400'
                    : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-slate-50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{story.emoji}</div>
                <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                  {story.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">{story.reference}</p>
              </button>
            ))}
          </div>

          {/* Active Story Card */}
          <Card className={`border-2 shadow-xl bg-gradient-to-br ${selectedStory.bgGradient} bg-white dark:bg-gray-950 overflow-hidden`}>
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-white dark:bg-black shadow-sm flex-shrink-0">
                  {selectedStory.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <Badge className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase">
                    {selectedStory.reference}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
                    {selectedStory.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
              {/* Memory Verse Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-black/60 border border-slate-200 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
                  📖 Memory Verse:
                </p>
                <p className="text-sm sm:text-base font-serif italic text-slate-800 dark:text-gray-200 font-bold leading-snug">
                  "{selectedStory.verse}"
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 text-right mt-1 font-semibold">
                  — {selectedStory.reference}
                </p>
              </div>

              {/* Story Narrative */}
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                <p>{selectedStory.summary}</p>
              </div>

              {/* Key Takeaway Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-300 dark:border-amber-700 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-400 text-amber-950 font-black mt-0.5">
                  <Heart className="w-4 h-4 fill-amber-950" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Sabbath Lesson for You:
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedStory.takeaway}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/verse-master" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl gap-2 shadow-md">
                    <Trophy className="w-4 h-4" />
                    <span>Recite Verse in Verse Master</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. SING-ALONG SONGS TAB */}
      {activeTab === 'songs' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {KIDS_SONGS.map((song) => (
              <button
                key={song.title}
                onClick={() => setSelectedSong(song)}
                className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all min-h-[44px] ${
                  selectedSong.title === song.title
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 shadow-md ring-2 ring-purple-400'
                    : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-slate-50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{song.emoji}</div>
                <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{song.title}</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate">{song.theme}</p>
              </button>
            ))}
          </div>

          <Card className="border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-white dark:to-gray-950 shadow-xl overflow-hidden">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex-shrink-0">
                    {selectedSong.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Badge className="bg-purple-600 text-white text-[9px] sm:text-[10px] font-black uppercase">
                      {selectedSong.theme}
                    </Badge>
                    <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
                      {selectedSong.title}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Lyrics Sing-Along Display */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white/90 dark:bg-black/60 border border-slate-200 dark:border-gray-800 shadow-inner text-center space-y-1.5 sm:space-y-2">
                {selectedSong.lyrics.map((line, idx) => (
                  <p 
                    key={idx} 
                    className={`font-sans ${
                      line === '' 
                        ? 'py-0.5 sm:py-1' 
                        : 'text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div className="flex justify-center">
                <Link to="/hymns" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold gap-2 border-purple-300 dark:border-purple-800 text-xs sm:text-sm min-h-[44px]">
                    <Music className="w-4 h-4 text-purple-600" />
                    <span>Open Full Adventist Hymnal (695 Songs)</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. SABBATH NATURE EXPLORER TAB */}
      {activeTab === 'nature' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-gray-950 shadow-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                    <Trees className="w-3.5 h-3.5" />
                    <span>Sabbath Afternoon Scavenger Hunt</span>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    God’s Wonderful Creation Bingo 🌿
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Step outside with family on Sabbath afternoon. Check off items you discover and earn Explorer Stars!
                  </CardDescription>
                </div>

                <div className="bg-emerald-100 dark:bg-emerald-950 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-center self-start sm:self-auto">
                  <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Found</p>
                  <p className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-200">
                    {completedCount} / {NATURE_ITEMS.length}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {NATURE_ITEMS.map((item) => {
                  const isChecked = !!checkedNature[item.id];
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleNature(item.id)}
                      className={`p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[44px] ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 shadow-md'
                          : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-gray-800 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs sm:text-sm font-bold truncate ${
                            isChecked ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {item.label}
                          </p>
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 dark:border-gray-600'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {item.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedCount === NATURE_ITEMS.length && (
                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 text-center space-y-1.5 sm:space-y-2 shadow-xl animate-bounce">
                  <p className="text-xl sm:text-2xl font-black">🎉 CONGRATULATIONS! 🎉</p>
                  <p className="text-xs sm:text-sm font-bold">
                    You completed the Sabbath Nature Hunt! You’re an Official Creation Explorer!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
