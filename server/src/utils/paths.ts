import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// In ES Modules ("type": "module"), __dirname doesn't exist natively — this recreates it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Points to: ai-video-editor/server/uploads
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Ensure the folder exists on startup so uploads never crash with "ENOENT: folder not found"
fs.mkdirSync(UPLOADS_DIR, { recursive: true });