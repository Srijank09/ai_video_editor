import OpenAI from "openai";
import fs from "node:fs";
import { config } from "../config"

export interface TranscriptWord {
  id: number;
  word: string;
  start: number;
  end: number;
}

export interface Transcript {
  videoId: string;
  language: string;
  duration: number;
  words: TranscriptWord[];
}

// The shape of Groq's response that OUR code depends on
interface GroqVerboseResponse {
  language: string;
  duration: number;
  words?: { word: string; start: number; end: number }[];
}

// Created the first time it's needed (lazy). By then, config.ts has loaded .env
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!config.groqApiKey) {
      throw new Error("GROQ_API_KEY is missing. Add it to server/.env and restart the server.");
    }
    client = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

export async function transcribeAudio(wavPath: string, videoId: string): Promise<Transcript> {
  const fileStream = fs.createReadStream(wavPath);

  const response = (await getClient().audio.transcriptions.create({
    file: fileStream,
    model: "whisper-large-v3-turbo",
    language: "en",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  })) as unknown as GroqVerboseResponse;

  // With timestamp_granularities: ["word"], Groq returns words as a TOP-LEVEL array
  const words: TranscriptWord[] = (response.words ?? []).map((w, index) => ({
    id: index,
    word: w.word.trim(),
    start: w.start,
    end: w.end,
  }));

  if (words.length === 0) {
    throw new Error("Whisper returned no words. The clip may have no speech.");
  }

  return {
    videoId,
    language: response.language,
    duration: response.duration,
    words,
  };
}