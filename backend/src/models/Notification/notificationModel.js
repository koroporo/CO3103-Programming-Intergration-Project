async function listByRecipient(client, recipientId, { limit, offset, unread }) {
  const { rows } = await client.query(`
    SELECT * FROM notifications WHERE recipient_id = $1 AND (NOT $2::boolean OR read_at IS NULL)
    ORDER BY created_at DESC, id DESC LIMIT $3 OFFSET $4`, [recipientId, unread, limit + 1, offset]);
  return rows;
}

async function unreadCount(client, recipientId) {
  const { rows } = await client.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL", [recipientId]);
  return rows[0].count;
}

async function markRead(client, recipientId, id) {
  const { rows } = await client.query(`UPDATE notifications SET read_at = COALESCE(read_at, NOW())
    WHERE id = $1 AND recipient_id = $2 RETURNING *`, [id, recipientId]);
  return rows[0];
}

async function markAllRead(client, recipientId) {
  await client.query("UPDATE notifications SET read_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL", [recipientId]);
}

module.exports = { listByRecipient, unreadCount, markRead, markAllRead };
