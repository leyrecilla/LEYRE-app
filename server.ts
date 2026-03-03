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
    folder TEXT,
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
    folder TEXT,
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
    quotes TEXT,
    folder TEXT
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    date TEXT,
    category TEXT,
    folder TEXT
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
    completed INTEGER DEFAULT 0,
    folder TEXT
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    type TEXT, -- 'notes', 'documents', etc.
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    category TEXT,
    folder TEXT
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

  // Auth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Google Client ID not configured" });
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const userData = await userRes.json();

      // Upsert user
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(userData.email);
      if (!user) {
        const result = db.prepare("INSERT INTO users (email, name, avatar) VALUES (?, ?, ?)").run(
          userData.email,
          userData.name,
          userData.picture
        );
        user = { id: result.lastInsertRowid, ...userData };
      }

      // In a real app, we'd set a session cookie here.
      // For this demo, we'll just send a success message.
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "GitHub Client ID not configured" });
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user:email',
    });
    
    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });

      const tokens = await tokenRes.json();
      if (tokens.error) throw new Error(tokens.error_description);

      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const userData = await userRes.json();

      // GitHub might not return email in /user if it's private, so fetch emails
      let email = userData.email;
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const emails = await emailsRes.json();
        const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
        email = primaryEmail.email;
      }

      // Upsert user
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        const result = db.prepare("INSERT INTO users (email, name, avatar) VALUES (?, ?, ?)").run(
          email,
          userData.name || userData.login,
          userData.avatar_url
        );
        user = { id: result.lastInsertRowid, email, name: userData.name || userData.login, avatar: userData.avatar_url };
      }

      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Generic CRUD helper - GET
  app.get("/api/:table", (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['users', 'notes', 'tasks', 'learning', 'books', 'lists', 'birthdays', 'documents', 'reminders', 'folders'];
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

  // Generic CRUD helper - POST
  app.post("/api/:table", (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['notes', 'tasks', 'learning', 'books', 'lists', 'birthdays', 'documents', 'reminders', 'folders'];
      if (!allowedTables.includes(table)) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      const body = req.body;
      const keys = Object.keys(body).filter(k => k !== 'id');
      const values = keys.map(k => typeof body[k] === 'object' ? JSON.stringify(body[k]) : body[k]);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = db.prepare(sql).run(...values);
      
      res.json({ id: result.lastInsertRowid, ...body });
    } catch (error) {
      console.error(`Error inserting into ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Generic CRUD helper - PUT
  app.put("/api/:table/:id", (req, res) => {
    try {
      const { table, id } = req.params;
      const allowedTables = ['users', 'notes', 'tasks', 'learning', 'books', 'lists', 'birthdays', 'documents', 'reminders', 'folders'];
      if (!allowedTables.includes(table)) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      const body = req.body;
      const keys = Object.keys(body).filter(k => k !== 'id');
      const values = keys.map(k => typeof body[k] === 'object' ? JSON.stringify(body[k]) : body[k]);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      db.prepare(sql).run(...values, id);
      
      res.json({ id, ...body });
    } catch (error) {
      console.error(`Error updating ${req.params.table}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Generic CRUD helper - DELETE
  app.delete("/api/:table/:id", (req, res) => {
    try {
      const { table, id } = req.params;
      const allowedTables = ['notes', 'tasks', 'learning', 'books', 'lists', 'birthdays', 'documents', 'reminders', 'folders'];
      if (!allowedTables.includes(table)) {
        return res.status(404).json({ error: "Table not found" });
      }
      
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
