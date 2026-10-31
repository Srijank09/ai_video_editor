import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // load .env into process.env

const app = express();

// MIDDLEWARE: every request passes through these functions in order
app.use(cors());        // adds headers so a browser on :5173 may call :4000
app.use(express.json()); // parses JSON request bodies (needed later for uploads metadata)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});