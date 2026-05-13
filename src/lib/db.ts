import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let dbPromise: Promise<Database> | null = null;

export async function getDb() {
  if (!dbPromise) {
    const filename = path.join(process.cwd(), "data.sqlite");
    dbPromise = open({
      filename,
      driver: sqlite3.Database,
    });

    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );
    `);
  }

  return dbPromise;
}
