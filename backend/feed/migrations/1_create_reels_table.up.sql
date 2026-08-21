CREATE TABLE IF NOT EXISTS reels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pillar VARCHAR(50) NOT NULL, -- "prophecy", "gospel", "sabbath", "health", "kids"
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 60,
    telegram_cta_url TEXT DEFAULT "https://t.me/adventmessage",
    likes_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reels_pillar ON reels(pillar);
CREATE INDEX IF NOT EXISTS idx_reels_published_at ON reels(published_at DESC);

-- Seed initial reels for high-impact launch
INSERT INTO reels (title, description, pillar, video_url, thumbnail_url, duration_seconds, telegram_cta_url, likes_count, is_featured)
VALUES 
(
    "The 2,300 Day Prophecy in 60 Seconds",
    "Discover Daniel 8:14 and how the cleansing of the sanctuary points directly to Jesus as our High Priest. #Prophecy #AdventMessage #Daniel814",
    "prophecy",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&auto=format&fit=crop&q=80",
    58,
    "https://t.me/adventmessage",
    342,
    true
),
(
    "Why Sunset Friday is a Sacred Pause",
    "From Eden to Eternity, the 7th-day Sabbath was God''s first gift of restful sanctuary in time. Drop everything and breathe.",
    "sabbath",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
    45,
    "https://t.me/adventmessage",
    528,
    true
),
(
    "Grace in the Sanctuary: The Mercy Seat",
    "God didn''t build the earthly sanctuary to terrify us — He built it so we would know He dwells among us. #JesusIsCenter",
    "gospel",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&auto=format&fit=crop&q=80",
    52,
    "https://t.me/adventmessage",
    419,
    false
),
(
    "Eight Laws of Health (N.E.W.S.T.A.R.T.) Explained",
    "Nutrition, Exercise, Water, Sunshine, Temperance, Air, Rest, and Trust in Divine Power. God''s blueprint for vibrant vitality.",
    "health",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80",
    60,
    "https://t.me/adventmessage",
    289,
    false
),
(
    "Little Pioneers: Joseph''s Coat & Dream Quest",
    "Join Little Joseph in Egypt and learn how God turns tough days into wonderful blessings for everyone who trusts Him! #KidsGo",
    "kids",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=80",
    40,
    "https://t.me/adventmessage",
    614,
    true
);
