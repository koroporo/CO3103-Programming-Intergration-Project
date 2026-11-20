-- Optional for existing databases; the forum uses the existing table structure.
CREATE INDEX IF NOT EXISTS discussions_visible_threads_idx
  ON discussions (lesson_id, is_pinned DESC, created_at DESC, id DESC)
  WHERE parent_id IS NULL AND status = 'visible';

CREATE INDEX IF NOT EXISTS discussions_visible_replies_idx
  ON discussions (parent_id, created_at, id) WHERE status = 'visible';

CREATE INDEX IF NOT EXISTS notifications_recipient_timeline_idx
  ON notifications (recipient_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS notifications_recipient_unread_idx
  ON notifications (recipient_id) WHERE read_at IS NULL;
