import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb } from "./src/server/db.ts";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // Socket.io connection
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Admin credentials not configured in server environment" });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin", email }, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ success: true, token });
    }

    res.status(401).json({ error: "Invalid credentials" });
  });

  // Middleware to verify admin token
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- Admin API Routes ---

  // Posts / Anime Management
  app.get("/api/admin/animes", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const animes = await db.collection("animes").find().sort({ createdAt: -1 }).toArray();
      res.json(animes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch animes" });
    }
  });

  app.post("/api/admin/animes", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const anime = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const result = await db.collection("animes").insertOne(anime);
      io.emit("animeCreated", anime);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to create anime" });
    }
  });

  app.put("/api/admin/animes/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date().toISOString() };
      delete updates._id;
      const result = await db.collection("animes").updateOne({ id }, { $set: updates });
      io.emit("animeUpdated", { id, updates });
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to update anime" });
    }
  });

  app.delete("/api/admin/animes/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      await db.collection("animes").deleteOne({ id });
      io.emit("animeDeleted", id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete anime" });
    }
  });

  app.post("/api/admin/animes/bulk-delete", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { ids } = req.body;
      await db.collection("animes").deleteMany({ id: { $in: ids } });
      await logActivity("Bulk Delete Animes", `Deleted ${ids.length} animes`);
      io.emit("animesBulkDeleted", ids);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Bulk delete failed" });
    }
  });

  app.post("/api/admin/animes/bulk-status", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { ids, status } = req.body;
      await db.collection("animes").updateMany({ id: { $in: ids } }, { $set: { status, updatedAt: new Date().toISOString() } });
      await logActivity("Bulk Status Update", `Updated ${ids.length} animes to ${status}`);
      io.emit("animesBulkStatusUpdated", { ids, status });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Bulk status update failed" });
    }
  });
  
  // Page Management
  app.get("/api/admin/pages", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const pages = await db.collection("pages").find().sort({ createdAt: -1 }).toArray();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.post("/api/admin/pages", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const page = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const result = await db.collection("pages").insertOne(page);
      io.emit("pageCreated", page);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.put("/api/admin/pages/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date().toISOString() };
      delete updates._id;
      const result = await db.collection("pages").updateOne({ id }, { $set: updates });
      io.emit("pageUpdated", { id, updates });
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      await db.collection("pages").deleteOne({ id });
      io.emit("pageDeleted", id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  app.post("/api/admin/pages/bulk-delete", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const { ids } = req.body;
      await db.collection("pages").deleteMany({ id: { $in: ids } });
      await logActivity("Bulk Delete Pages", `Deleted ${ids.length} pages`);
      io.emit("pagesBulkDeleted", ids);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Bulk delete failed" });
    }
  });

  // Taxonomy Management
  app.get("/api/admin/taxonomies", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const taxes = await db.collection("taxonomies").find().toArray();
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch taxonomies" });
    }
  });

  app.post("/api/admin/taxonomies", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const result = await db.collection("taxonomies").insertOne(req.body);
      io.emit("taxonomyCreated", req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to create taxonomy" });
    }
  });

  app.delete("/api/admin/taxonomies/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      await db.collection("taxonomies").deleteOne({ id: req.params.id });
      io.emit("taxonomyDeleted", req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete taxonomy" });
    }
  });

  // Comment Management
  app.get("/api/admin/comments", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const comments = await db.collection("comments").find().sort({ createdAt: -1 }).toArray();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.put("/api/admin/comments/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      await db.collection("comments").updateOne({ id: req.params.id }, { $set: req.body });
      io.emit("commentUpdated", { id: req.params.id, updates: req.body });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      await db.collection("comments").deleteOne({ id: req.params.id });
      io.emit("commentDeleted", req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Activity Logs
  app.get("/api/admin/activities", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const activities = await db.collection("activities").find().sort({ timestamp: -1 }).limit(50).toArray();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Helper to log activities (internal)
  const logActivity = async (action: string, details: string, user: string = "Admin") => {
    try {
      const db = await getDb();
      const log = {
        action,
        details,
        user,
        timestamp: new Date().toISOString()
      };
      await db.collection("activities").insertOne(log);
      io.emit("activityLogged", log);
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  // We should call logActivity in other routes, but for now we'll just add the GET endpoint
  // and maybe log the admin login
  
  // Analytics & SEO
  app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const totalAnimes = await db.collection("animes").countDocuments();
      const totalComments = await db.collection("comments").countDocuments();
      
      // Mocked analytics for demo purposes
      res.json({
        totalAnimes,
        totalComments,
        visits: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
        topPosts: await db.collection("animes").find().limit(5).toArray(),
        suggestions: [
          "Improve meta descriptions for 12 posts",
          "Increase internal linking in Synopsis sections",
          "Compress 45 images to webp format for faster loading"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Public Anime API
  app.get("/api/animes", async (req, res) => {
    try {
      const db = await getDb();
      const animes = await db.collection("animes").find().sort({ createdAt: -1 }).toArray();
      res.json(animes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch animes" });
    }
  });

  app.get("/api/animes/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const anime = await db.collection("animes").findOne({ id });
      if (!anime) return res.status(404).json({ error: "Anime not found" });
      res.json(anime);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anime" });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example MongoDB Route: Fetch favorite animes
  app.get("/api/favorites", async (req, res) => {
    try {
      const db = await getDb();
      const favorites = await db.collection("favorites").find({}).toArray();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Example MongoDB Route: Add to favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const db = await getDb();
      const anime = req.body;
      const result = await db.collection("favorites").updateOne(
        { id: anime.id },
        { $set: anime },
        { upsert: true }
      );
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to save favorite" });
    }
  });

  // Example MongoDB Route: Remove from favorites
  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const result = await db.collection("favorites").deleteOne({ id });
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete favorite" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
