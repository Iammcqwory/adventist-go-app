import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  Send, 
  Flame, 
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";

interface ReelItem {
  id: number;
  title: string;
  description: string | null;
  pillar: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  telegramCtaUrl: string;
  likesCount: number;
  sharesCount: number;
  isFeatured: boolean;
  publishedAt: string;
}

const FALLBACK_REELS: ReelItem[] = [
  {
    id: 1,
    title: "The 2,300 Day Prophecy in 60 Seconds",
    description: "Discover Daniel 8:14 and how the cleansing of the sanctuary points directly to Jesus as our High Priest. #Prophecy #AdventMessage #Daniel814",
    pillar: "prophecy",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80",
    durationSeconds: 58,
    telegramCtaUrl: "https://t.me/adventmessage",
    likesCount: 342,
    sharesCount: 88,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Why Sunset Friday is a Sacred Sanctuary in Time",
    description: "From Eden to Eternity, the 7th-day Sabbath was God's first gift of restful sanctuary in time. Drop everything and breathe.",
    pillar: "sabbath",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    durationSeconds: 45,
    telegramCtaUrl: "https://t.me/adventmessage",
    likesCount: 528,
    sharesCount: 142,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Grace in the Sanctuary: The Mercy Seat",
    description: "God didn't build the earthly sanctuary to terrify us — He built it so we would know He dwells among us. #JesusIsCenter",
    pillar: "gospel",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80",
    durationSeconds: 52,
    telegramCtaUrl: "https://t.me/adventmessage",
    likesCount: 419,
    sharesCount: 65,
    isFeatured: false,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Eight Laws of Health (N.E.W.S.T.A.R.T.) Explained",
    description: "Nutrition, Exercise, Water, Sunshine, Temperance, Air, Rest, and Trust in Divine Power. God's blueprint for vibrant vitality.",
    pillar: "health",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
    durationSeconds: 60,
    telegramCtaUrl: "https://t.me/adventmessage",
    likesCount: 289,
    sharesCount: 51,
    isFeatured: false,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Little Pioneers: Joseph's Coat & Dream Quest",
    description: "Join Little Joseph in Egypt and learn how God turns tough days into wonderful blessings for everyone who trusts Him! #KidsGo",
    pillar: "kids",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80",
    durationSeconds: 40,
    telegramCtaUrl: "https://t.me/adventmessage",
    likesCount: 614,
    sharesCount: 190,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
  },
];

const PILLARS = [
  { id: "all", label: "All Messages", icon: Sparkles, color: "bg-blue-500 text-white" },
  { id: "prophecy", label: "Prophecy", icon: Flame, color: "bg-amber-500 text-white" },
  { id: "sabbath", label: "Sabbath", icon: Clock, color: "bg-indigo-500 text-white" },
  { id: "gospel", label: "Gospel", icon: Compass, color: "bg-emerald-500 text-white" },
  { id: "health", label: "Health (NEWSTART)", icon: Sparkles, color: "bg-teal-500 text-white" },
  { id: "kids", label: "Kids Go", icon: Sparkles, color: "bg-pink-500 text-white" },
];

export function ReelsFeed() {
  const queryClient = useQueryClient();
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["daily-reels", selectedPillar],
    queryFn: async () => {
      try {
        const res = await backend.feed.getDailyReels({
          pillar: selectedPillar === "all" ? undefined : selectedPillar,
        });
        if (res?.reels && res.reels.length > 0) {
          return res.reels;
        }
      } catch (err) {
        console.warn("Backend feed unavailable, using offline fallback reels:", err);
      }
      // Filter fallback list by pillar if needed
      return selectedPillar === "all"
        ? FALLBACK_REELS
        : FALLBACK_REELS.filter((r) => r.pillar.toLowerCase() === selectedPillar.toLowerCase());
    },
  });

  const reels: ReelItem[] = data || FALLBACK_REELS;
  const currentReel = reels[currentIndex] || reels[0];

  const likeMutation = useMutation({
    mutationFn: async (reelId: number) => {
      try {
        return await backend.feed.likeReel({ id: reelId });
      } catch {
        return { id: reelId, likesCount: (currentReel?.likesCount || 0) + 1, success: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reels"] });
    },
  });

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleLike = (id: number) => {
    if (likedReels[id]) return;
    setLikedReels((prev) => ({ ...prev, [id]: true }));
    likeMutation.mutate(id);
  };

  const handleShare = (reel: ReelItem) => {
    if (navigator.share) {
      navigator
        .share({
          title: reel.title,
          text: reel.description || reel.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${reel.title} - Watch on Adventist Go: ${window.location.origin}/reels`
      );
      setCopiedId(reel.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-4 sm:p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">The Advent Message Reels</h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Bite-sized prophecy, sanctuary gospel, Sabbath sanctuary & kids quests.
          </p>
        </div>
        <a
          href="https://t.me/adventmessage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto min-h-[38px]"
        >
          <Send className="w-4 h-4" />
          Join Telegram Hub
        </a>
      </div>

      {/* Pillar Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PILLARS.map((p) => {
          const isSelected = selectedPillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPillar(p.id);
                setCurrentIndex(0);
              }}
              className={`px-3 sm:px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm min-h-[38px] ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black scale-105"
                  : "bg-white/80 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700"
              }`}
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Vertical Reels Player Card */}
      {currentReel && (
        <Card className="relative overflow-hidden rounded-3xl border-slate-300 dark:border-gray-800 bg-black shadow-2xl aspect-[9/16] max-h-[78vh] sm:max-h-[720px] mx-auto flex flex-col justify-between">
          {/* Video Container */}
          <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
            <video
              ref={videoRef}
              src={currentReel.videoUrl}
              poster={currentReel.thumbnailUrl || undefined}
              loop
              playsInline
              muted={isMuted}
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
          </div>

          {/* Top Info Bar */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <Badge className="bg-black/60 backdrop-blur-md border border-white/20 text-white uppercase text-[10px] tracking-wider px-2.5 py-1">
              {currentReel.pillar}
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={isMuted ? "Unmute video audio" : "Mute video audio"}
                className="h-9 w-9 p-0 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <span className="text-xs text-white/80 font-mono bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {reels.length}
              </span>
            </div>
          </div>

          {/* Play/Pause Overlay Indicator on click */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white animate-pulse">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          )}

          {/* Right Action Sidebar (Like, Share, Telegram, Navigation) */}
          <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
            {/* Like button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(currentReel.id);
              }}
              aria-label={`Like reel ${currentReel.title}, current likes: ${(currentReel.likesCount || 0) + (likedReels[currentReel.id] ? 1 : 0)}`}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all transform group-hover:scale-110 active:scale-90 ${
                  likedReels[currentReel.id]
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
                    : "bg-black/50 text-white hover:bg-black/70"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    likedReels[currentReel.id] ? "fill-white" : ""
                  }`}
                />
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow">
                {(currentReel.likesCount || 0) + (likedReels[currentReel.id] ? 1 : 0)}
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(currentReel);
              }}
              aria-label={`Share reel ${currentReel.title}`}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-all group-hover:scale-110 active:scale-90">
                {copiedId === currentReel.id ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Share2 className="w-6 h-6" />
                )}
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow">
                {copiedId === currentReel.id ? "Copied!" : "Share"}
              </span>
            </button>

            {/* Up / Down navigation buttons */}
            <div className="flex flex-col gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous reel"
                className="w-10 h-10 p-0 rounded-full bg-black/40 text-white hover:bg-black/70 disabled:opacity-30 backdrop-blur-sm"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentIndex === reels.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next reel"
                className="w-10 h-10 p-0 rounded-full bg-black/40 text-white hover:bg-black/70 disabled:opacity-30 backdrop-blur-sm"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Bottom Captions and Community CTA */}
          <div className="relative z-10 p-5 space-y-3">
            <div className="pr-16">
              <h2 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                {currentReel.title}
              </h2>
              <p className="text-xs text-slate-200 mt-1 line-clamp-2 drop-shadow">
                {currentReel.description}
              </p>
            </div>

            {/* Telegram Funnel Banner */}
            <div className="pt-1">
              <a
                href={currentReel.telegramCtaUrl || "https://t.me/adventmessage"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-between shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Join Discussion in Adventist Community</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
