import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import videoRoutes from "./routes/videos";
import { UPLOADS_DIR } from "./utils/paths";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve video files — automatically supports HTTP Range requests for timeline scrubbing!
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Mount all routes from routes/videos.ts under /api/videos
app.use("/api/videos", videoRoutes);

// Global error handler (catches Multer errors like "File too large" or "Only video files allowed")
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err.message);
  res.status(400).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});