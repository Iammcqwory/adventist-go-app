import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Trophy, 
  Award, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  Coins, 
  Flame, 
  BookOpen, 
  ArrowRight,
  Puzzle,
  Play,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MemoryVerse {
  id: string;
  reference: string;
  text: string;
  tier: "beginner" | "junior" | "youth";
  theme: string;
  coinsReward: number;
}

const VERSES: MemoryVerse[] = [
  {
    id: "gen-1-1",
    reference: "Genesis 1:1",
    text: "In the beginning God created the heaven and the earth.",
    tier: "beginner",
    theme: "Creation",
    coinsReward: 10,
  },
  {
    id: "john-3-16",
    reference: "John 3:16",
    text: "For God so loved the world, that He gave His only begotten Son, that whosoever believeth in Him should not perish, but have everlasting life.",
    tier: "beginner",
    theme: "Salvation",
    coinsReward: 15,
  },
  {
    id: "exod-20-8",
    reference: "Exodus 20:8",
    text: "Remember the sabbath day, to keep it holy.",
    tier: "beginner",
    theme: "Sabbath",
    coinsReward: 10,
  },
  {
    id: "prov-3-5",
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge Him, and He shall direct thy paths.",
    tier: "junior",
    theme: "Faith & Trust",
    coinsReward: 25,
  },
  {
    id: "phil-4-13",
    reference: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me.",
    tier: "junior",
    theme: "Courage",
    coinsReward: 20,
  },
  {
    id: "rev-14-7",
    reference: "Revelation 14:7",
    text: "Fear God, and give glory to Him; for the hour of His judgment is come: and worship Him that made heaven, and earth, and the sea, and the fountains of waters.",
    tier: "youth",
    theme: "First Angel's Message",
    coinsReward: 40,
  },
  {
    id: "dan-8-14",
    reference: "Daniel 8:14",
    text: "Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    tier: "youth",
    theme: "Sanctuary Prophecy",
    coinsReward: 35,
  },
];

// Helper to clean punctuation and normalize words for matching
function normalizeText(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Web Audio API victory fanfare synthesizer
function playVictoryFanfare() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.4);
    });
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export function VerseMaster() {
  const [selectedTier, setSelectedTier] = useState<"beginner" | "junior" | "youth">("beginner");
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [mode, setMode] = useState<"voice" | "puzzle">("voice");

  // Persistence for coins and streaks
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem("adventist_coins") || "50", 10);
  });
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem("adventist_streak") || "3", 10);
  });

  // Puzzle mode state (word tiles)
  const [puzzleSelectedWords, setPuzzleSelectedWords] = useState<string[]>([]);
  const [puzzleShuffledWords, setPuzzleShuffledWords] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);

  const filteredVerses = VERSES.filter((v) => v.tier === selectedTier);
  const activeVerse = filteredVerses[currentVerseIndex] || filteredVerses[0];
  const targetWords = normalizeText(activeVerse.text);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMode("puzzle");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript;
      }
      setSpokenTranscript(interim);
      calculateScore(interim);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [activeVerse]);

  // Reset states when changing verse or tier
  useEffect(() => {
    setSpokenTranscript("");
    setAccuracyScore(0);
    setIsCompleted(false);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Set up puzzle tiles
    const words = activeVerse.text.split(" ");
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setPuzzleShuffledWords(shuffled);
    setPuzzleSelectedWords([]);
  }, [currentVerseIndex, selectedTier]);

  const calculateScore = (transcript: string) => {
    const spokenWords = normalizeText(transcript);
    if (targetWords.length === 0) return;

    let matchCount = 0;
    spokenWords.forEach((word) => {
      if (targetWords.includes(word)) {
        matchCount++;
      }
    });

    const score = Math.min(100, Math.round((matchCount / targetWords.length) * 100));
    setAccuracyScore(score);

    if (score >= 80 && !isCompleted) {
      handleVerseSuccess();
    }
  };

  const handleVerseSuccess = () => {
    setIsCompleted(true);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const newCoins = coins + activeVerse.coinsReward;
    const newStreak = streak + 1;
    setCoins(newCoins);
    setStreak(newStreak);
    localStorage.setItem("adventist_coins", String(newCoins));
    localStorage.setItem("adventist_streak", String(newStreak));

    playVictoryFanfare();
  };

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpokenTranscript("");
      setAccuracyScore(0);
      setIsCompleted(false);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleTileClick = (word: string, index: number) => {
    const nextSelected = [...puzzleSelectedWords, word];
    setPuzzleSelectedWords(nextSelected);

    const nextShuffled = [...puzzleShuffledWords];
    nextShuffled.splice(index, 1);
    setPuzzleShuffledWords(nextShuffled);

    // Check if assembled sentence matches
    if (nextSelected.join(" ") === activeVerse.text.split(" ").join(" ")) {
      setAccuracyScore(100);
      handleVerseSuccess();
    } else if (nextSelected.length === activeVerse.text.split(" ").length) {
      // Completed but with mistakes
      setAccuracyScore(60);
    }
  };

  const resetPuzzle = () => {
    const words = activeVerse.text.split(" ");
    setPuzzleShuffledWords([...words].sort(() => Math.random() - 0.5));
    setPuzzleSelectedWords([]);
    setIsCompleted(false);
    setAccuracyScore(0);
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < filteredVerses.length - 1) {
      setCurrentVerseIndex((prev) => prev + 1);
    } else {
      setCurrentVerseIndex(0);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Top Gamification Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/20 border-amber-300 dark:border-amber-700">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                Sabbath Coins
              </p>
              <p className="text-xl font-black text-amber-900 dark:text-amber-100">{coins}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/20 border-orange-300 dark:border-orange-700">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-orange-800 dark:text-orange-300 tracking-wider">
                Day Streak
              </p>
              <p className="text-xl font-black text-orange-900 dark:text-orange-100">{streak} Days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/20 border-purple-300 dark:border-purple-700">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-purple-800 dark:text-purple-300 tracking-wider">
                Badge Level
              </p>
              <p className="text-xl font-black text-purple-900 dark:text-purple-100">Explorer II</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 border-emerald-300 dark:border-emerald-700">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
                Reward
              </p>
              <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">+{activeVerse.coinsReward}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Challenge Card */}
      <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-xl overflow-hidden bg-white dark:bg-gray-950">
        {/* Tier Header Navigation */}
        <div className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(["beginner", "junior", "youth"] as const).map((tier) => (
              <Button
                key={tier}
                size="sm"
                variant={selectedTier === tier ? "default" : "outline"}
                onClick={() => {
                  setSelectedTier(tier);
                  setCurrentVerseIndex(0);
                }}
                className={`capitalize font-bold text-xs rounded-xl ${
                  selectedTier === tier 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                    : "text-slate-600 dark:text-gray-300"
                }`}
              >
                {tier === "beginner" && "🌱 Beginner (3-6)"}
                {tier === "junior" && "⭐ Junior (7-11)"}
                {tier === "youth" && "🚀 Youth (12+)"}
              </Button>
            ))}
          </div>

          {/* Mode Switcher (Voice vs Puzzle) */}
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setMode("voice")}
              disabled={!speechSupported}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                mode === "voice"
                  ? "bg-white dark:bg-black text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Reciter
            </button>
            <button
              onClick={() => setMode("puzzle")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                mode === "puzzle"
                  ? "bg-white dark:bg-black text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              Word Builder
            </button>
          </div>
        </div>

        <CardHeader className="text-center pb-3 pt-6">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border-indigo-200">
              {activeVerse.theme}
            </Badge>
            <span className="text-xs text-slate-400 font-medium">
              Verse {currentVerseIndex + 1} of {filteredVerses.length}
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeVerse.reference}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            {mode === "voice"
              ? "Tap the microphone and recite the verse clearly from memory!"
              : "Tap the scrambled words in the correct order to assemble the scripture."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Target Verse Box */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 shadow-inner">
            <p className="text-lg sm:text-xl font-serif text-slate-800 dark:text-slate-100 text-center leading-relaxed font-medium">
              "{activeVerse.text}"
            </p>
          </div>

          {/* Voice Mode View */}
          {mode === "voice" && (
            <div className="space-y-6">
              {/* Mic Action Area */}
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative">
                  {isListening && (
                    <span className="animate-ping absolute inset-0 rounded-full bg-red-400 opacity-60"></span>
                  )}
                  <Button
                    size="lg"
                    onClick={toggleListening}
                    className={`w-24 h-24 rounded-full p-0 flex flex-col items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : isCompleted
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-10 h-10 animate-bounce" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </Button>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  {isListening
                    ? "Listening... Keep reciting!"
                    : isCompleted
                    ? "Perfect Recitation! 🎉"
                    : "Tap to Start Speaking"}
                </p>
              </div>

              {/* Accuracy Meter & Transcript Display */}
              <div className="space-y-3 bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-200 dark:border-gray-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                    Recitation Accuracy
                  </span>
                  <span
                    className={`font-black text-sm ${
                      accuracyScore >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : accuracyScore > 40
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {accuracyScore}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      accuracyScore >= 80
                        ? "bg-emerald-500"
                        : accuracyScore > 40
                        ? "bg-amber-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${accuracyScore}%` }}
                  />
                </div>
                {spokenTranscript && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Heard:</span>
                    <p className="text-xs text-slate-700 dark:text-gray-300 italic mt-0.5 font-mono">
                      "{spokenTranscript}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Puzzle Mode View */}
          {mode === "puzzle" && (
            <div className="space-y-6">
              {/* Assembled Sentence Box */}
              <div className="min-h-[60px] p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-wrap gap-2 items-center">
                {puzzleSelectedWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Tap the word tiles below to build the verse here...
                  </span>
                ) : (
                  puzzleSelectedWords.map((word, idx) => (
                    <Badge
                      key={idx}
                      className="bg-indigo-600 text-white font-medium text-sm py-1.5 px-3 rounded-lg shadow-sm"
                    >
                      {word}
                    </Badge>
                  ))
                )}
              </div>

              {/* Shuffled Available Tiles */}
              <div className="flex flex-wrap gap-2.5 justify-center py-2">
                {puzzleShuffledWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(word, idx)}
                    className="py-2 px-3.5 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 hover:border-indigo-500 rounded-xl text-sm font-semibold text-slate-800 dark:text-white shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {word}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPuzzle}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Word Tiles
                </Button>
              </div>
            </div>
          )}

          {/* Victory & Completion Box */}
          {isCompleted && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center shadow-lg space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-xl font-black">Verse Mastered! +{activeVerse.coinsReward} Sabbath Coins</h3>
              <p className="text-xs text-emerald-100 max-w-md mx-auto">
                "Thy word have I hid in mine heart, that I might not sin against thee." (Psalm 119:11)
              </p>
              <Button
                onClick={handleNextVerse}
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-md text-xs py-2 px-5 gap-2"
              >
                Next Memory Verse Challenge
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              disabled={currentVerseIndex === 0}
              onClick={() => setCurrentVerseIndex((prev) => prev - 1)}
              className="text-xs"
            >
              Previous Verse
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              {activeVerse.reference}
            </span>
            <Button
              size="sm"
              onClick={handleNextVerse}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1"
            >
              Next Verse
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
