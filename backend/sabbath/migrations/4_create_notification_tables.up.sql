CREATE TABLE notification_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  friday_prep_reminder BOOLEAN DEFAULT true,
  friday_prep_reminder_time INTEGER DEFAULT 120, -- minutes before sunset
  sabbath_welcome_notification BOOLEAN DEFAULT true,
  sabbath_end_notification BOOLEAN DEFAULT true,
  custom_reminders JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  was_delivered BOOLEAN DEFAULT false,
  delivery_method TEXT DEFAULT 'browser', -- browser, push, email
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at);
