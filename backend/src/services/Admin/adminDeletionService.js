const pool = require("../../db");
const { createError, positiveId } = require("../../utils/courseUltils");

// Preserve foreign keys, learning history and existing audit records.
const entities = {
  account: { table: "accounts", status: "deleted", columns: "id, role, status, updated_at" },
  course: { table: "courses", status: "archived", columns: "id, status, is_featured, updated_at" },
};

async function remove(entity, rawId, body, actor) {
  const config = entities[entity];
  if (!config) throw createError(400, "Invalid entity");
  const id = positiveId(rawId, "id");
  const actorId = positiveId(actor.id, "actor id");
  if (body !== undefined && (!body || typeof body !== "object" || Array.isArray(body))) {
    throw createError(400, "Request body must be a JSON object");
  }
  const reason = body?.reason;
  if (reason !== undefined && (typeof reason !== "string" || !reason.trim() || reason.length > 2000)) {
    throw createError(400, "reason must be a non-empty string of at most 2000 characters");
  }
  if (entity === "account" && id === actorId) {
    throw createError(409, "Administrators cannot delete their own account");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Lock account rows in ID order to avoid deadlocks between administrators.
    const ids = entity === "account" ? [actorId, id] : [actorId];
    const accounts = await client.query(
      "SELECT id, role, status, updated_at FROM accounts WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE",
      [ids],
    );
    const admin = accounts.rows.find((row) => String(row.id) === actorId);
    if (!admin || admin.status !== "active" || admin.role !== "admin") {
      throw createError(403, "An active administrator account is required");
    }
    const before = entity === "account"
      ? accounts.rows.find((row) => String(row.id) === id)
      : (await client.query(`SELECT ${config.columns} FROM courses WHERE id = $1 FOR UPDATE`, [id])).rows[0];
    if (!before) throw createError(404, `${entity === "account" ? "Account" : "Course"} not found`);
    // Protect administrator accounts so concurrent deletes cannot remove all admins.
    if (entity === "account" && before.role === "admin") {
      throw createError(409, "Administrator accounts cannot be deleted");
    }
    if (before.status === config.status) {
      await client.query("COMMIT");
      return before;
    }
    const after = (await client.query(
      `UPDATE ${config.table} SET status = $2, updated_at = NOW()${entity === "course" ? ", is_featured = FALSE" : ""}
       WHERE id = $1 RETURNING ${config.columns}`,
      [id, config.status],
    )).rows[0];
    if (entity === "account") {
      await client.query("UPDATE auth_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL", [id]);
    }
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role_snapshot, action, entity_type, entity_id,
        before_data, after_data, reason, created_at)
       VALUES ($1, 'admin', $2, $3, $4, $5::jsonb, $6::jsonb, $7, NOW())`,
      [actorId, `delete_${entity}`, entity, id, JSON.stringify(before), JSON.stringify(after), reason?.trim() ?? null],
    );
    await client.query("COMMIT");
    return after;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { remove };
