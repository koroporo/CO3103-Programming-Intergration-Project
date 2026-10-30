const postgresModule = require("postgres");
const postgres = postgresModule.default ?? postgresModule;

// Local: đọc DATABASE_URL. Trên Worker: worker.mjs ghi đè hàm này.
const config = { getUrl: () => process.env.DATABASE_URL };

const open = () =>
  postgres(config.getUrl(), { max: 1, fetch_types: false });

// Đổi kết quả của postgres.js về dạng { rows, rowCount } như pg
const toResult = (rows) => ({ rows: Array.from(rows), rowCount: rows.count ?? rows.length });

// Cách mới: withDb(sql => sql`...`)
async function withDb(fn) {
  const sql = open();
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

const pool = {
  // Cách cũ: pool.query("SELECT ... $1", [x])
  async query(text, params = []) {
    return withDb(async (sql) => toResult(await sql.unsafe(text, params)));
  },

  // Cách cũ: const client = await pool.connect(); BEGIN/COMMIT; client.release()
  async connect() {
    const sql = open(); // 1 kết nối riêng, nên BEGIN/COMMIT chạy đúng
    return {
      query: async (text, params = []) => toResult(await sql.unsafe(text, params)),
      release: () => sql.end(),
    };
  },

  withDb,
  config,
};

module.exports = pool;