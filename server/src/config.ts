import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Find server/.env no matter which folder the command was started from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: Number(process.env.PORT) || 4000,
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  // "ffmpeg" = find it on PATH. Otherwise use the exact file path from .env
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
};