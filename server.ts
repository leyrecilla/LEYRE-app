import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("mindflow.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    ai_settings TEXT DEFAULT '{"tone":"professional","instructions":""}'
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    folder TEXT,
    color TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    priority TEXT,
    due_date DATETIME,
    completed INTEGER DEFAULT 0,
    tags TEXT
  );

  CREATE TABLE IF NOT EXISTS learning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    url TEXT,
    type TEXT,
    category TEXT,
    status TEXT,
    description TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    author TEXT,
    category TEXT,
    status TEXT,
    pages_read INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    start_date DATETIME,
    notes TEXT,
    quotes TEXT
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    date TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    type TEXT,
    folder TEXT,
    size TEXT,
    last_modified TEXT
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    date TEXT,
    time TEXT,
    priority TEXT,
    completed INTEGER DEFAULT 0
  );
`);

// Handle lists table migration/creation separately to be safe
try {
  const tableInfo = db.prepare("PRAGMA table_info(lists)").all();
  if (tableInfo.length > 0) {
    const hasTitle = tableInfo.some((c: any) => c.name === 'title');
    if (!hasTitle) {
      console.log("Migrating lists table...");
      db.exec("DROP TABLE lists");
    }
  }
} catch (e) {
  console.error("Error checking lists table:", e);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    items TEXT,
    category TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || 'development' });
  });

  app.get("/api/user", (req, res) => {
    try {
      let user = db.prepare("SELECT * FROM users LIMIT 1").get();
      if (!user) {
        const id = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run("leyre.tf@gmail.com", "Leyre Tris").lastInsertRowid;
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Generic CRUD helper
  app.get("/api/:table", (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['users', 'notes', 'tasks', 'learning', 'books', 'lists', 'birthdays', 'documents', 'reminders'];
      if (!allowedTables.includes(table)) {
        return res.status(404).json({ error: "Table not found" });
      }
      const items = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
      res.json(items);
    } catch (error) {
      console.error(`Error fetching from ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/:table", (req, res) => {
    try {
      const { table } = req.params;
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const placeholders = keys.map(() => "?").join(",");
      const info = db.prepare(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`).run(...values);
      res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
      console.error(`Error inserting into ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/api/:table/:id", (req, res) => {
    try {
      const { table, id } = req.params;
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const setClause = keys.map(key => `${key} = ?`).join(",");
      db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, id);
      res.json({ id, ...req.body });
    } catch (error) {
      console.error(`Error updating ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.delete("/api/:table/:id", (req, res) => {
    try {
      const { table, id } = req.params;
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting from ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
