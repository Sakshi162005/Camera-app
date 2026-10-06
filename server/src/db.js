// PostgreSQL data access. Tables are created on startup by migrate().
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => console.error('[db] idle client error', err.message));

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY,
      username      TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (lower(username));

    CREATE TABLE IF NOT EXISTS cameras (
      id          UUID PRIMARY KEY,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      source      TEXT NOT NULL DEFAULT '',
      group_path  TEXT NOT NULL DEFAULT '',
      roles       TEXT[] NOT NULL DEFAULT ARRAY['admin', 'viewer'],
      created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS cameras_group_idx ON cameras (group_path);
  `);
}

const userCols = 'id, username, role, created_at AS "createdAt"';

export const users = {
  async all() {
    const r = await pool.query(`SELECT ${userCols} FROM users ORDER BY created_at`);
    return r.rows;
  },
  async count() {
    const r = await pool.query('SELECT count(*)::int AS n FROM users');
    return r.rows[0].n;
  },
  // Includes the password hash; only used by login.
  async findByUsernameWithHash(username) {
    const r = await pool.query(
      `SELECT ${userCols}, password_hash AS "passwordHash" FROM users WHERE lower(username) = lower($1)`,
      [username],
    );
    return r.rows[0] || null;
  },
  async findByUsername(username) {
    const r = await pool.query(`SELECT ${userCols} FROM users WHERE lower(username) = lower($1)`, [username]);
    return r.rows[0] || null;
  },
  async findById(id) {
    const r = await pool.query(`SELECT ${userCols} FROM users WHERE id = $1`, [id]);
    return r.rows[0] || null;
  },
  async create({ username, passwordHash, role }) {
    const r = await pool.query(
      `INSERT INTO users (id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${userCols}`,
      [randomUUID(), username, passwordHash, role],
    );
    return r.rows[0];
  },
  async update(id, { role, passwordHash }) {
    const r = await pool.query(
      `UPDATE users SET role = COALESCE($2, role), password_hash = COALESCE($3, password_hash)
       WHERE id = $1 RETURNING ${userCols}`,
      [id, role ?? null, passwordHash ?? null],
    );
    return r.rows[0] || null;
  },
  async remove(id) {
    const r = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return r.rowCount > 0;
  },
};

const cameraCols =
  'id, name, type, source, group_path AS "group", roles, created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt"';

export const cameras = {
  async all() {
    const r = await pool.query(`SELECT ${cameraCols} FROM cameras ORDER BY group_path, name`);
    return r.rows;
  },
  async count() {
    const r = await pool.query('SELECT count(*)::int AS n FROM cameras');
    return r.rows[0].n;
  },
  async findById(id) {
    const r = await pool.query(`SELECT ${cameraCols} FROM cameras WHERE id = $1`, [id]);
    return r.rows[0] || null;
  },
  async create({ name, type, source, group, roles, createdBy }) {
    const r = await pool.query(
      `INSERT INTO cameras (id, name, type, source, group_path, roles, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${cameraCols}`,
      [randomUUID(), name, type, source, group, roles, createdBy ?? null],
    );
    return r.rows[0];
  },
  async update(id, { name, type, source, group, roles }) {
    const r = await pool.query(
      `UPDATE cameras SET
         name = COALESCE($2, name),
         type = COALESCE($3, type),
         source = COALESCE($4, source),
         group_path = COALESCE($5, group_path),
         roles = COALESCE($6, roles),
         updated_at = now()
       WHERE id = $1 RETURNING ${cameraCols}`,
      [id, name ?? null, type ?? null, source ?? null, group ?? null, roles ?? null],
    );
    return r.rows[0] || null;
  },
  async remove(id) {
    const r = await pool.query('DELETE FROM cameras WHERE id = $1', [id]);
    return r.rowCount > 0;
  },
};
