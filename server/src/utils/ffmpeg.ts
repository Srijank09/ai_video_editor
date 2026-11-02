// import { spawn } from "node:child_process";
// import path from "node:path";
// import fs from "node:fs";

// export function extractAudio(videoPath: string): Promise<string> {
//   const wavPath = videoPath.replace(/\.\w+$/, ".wav");

//   return new Promise((resolve, reject) => {
//     const ffmpeg = spawn("ffmpeg", [
//       "-i", videoPath,
//       "-vn",
//       "-acodec", "pcm_s16le",
//       "-ar", "16000",
//       "-ac", "1",
//       "-y",
//       wavPath,
//     ]);

//     let stderr = "";
//     ffmpeg.stderr.on("data", (chunk: Buffer) => {
//       stderr += chunk.toString();
//     });

//     ffmpeg.on("close", (code) => {
//       if (code === 0) {
//         resolve(wavPath);
//       } else {
//         reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
//       }
//     });

//     ffmpeg.on("error", (err) => {
//       reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
//     });
//   });
// }
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

/**
 * Extracts audio from a video file and saves as 16kHz mono WAV.
 * Returns the path to the extracted .wav file.
 */
export function extractAudio(videoPath: string): Promise<string> {
  const wavPath = videoPath.replace(/\.\w+$/, ".wav");

  return new Promise((resolve, reject) => {
    // -i input.mp4          : input file
    // -vn                   : no video (strip video stream entirely)
    // -acodec pcm_s16le     : 16-bit PCM (uncompressed, no lossy artifacts)
    // -ar 16000             : 16kHz sample rate (Whisper's native rate)
    // -ac 1                 : mono (1 channel; stereo doubles file size for no benefit)
    const ffmpeg = spawn("ffmpeg", [
      "-i", videoPath,
      "-vn",
      "-acodec", "pcm_s16le",
      "-ar", "16000",
      "-ac", "1",
      "-y",              // overwrite output without prompting
      wavPath,
    ]);

    let stderr = "";
    ffmpeg.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(wavPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on("error", (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}