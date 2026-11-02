import { useState, useRef, useCallback } from "react";
import { UploadedVideo } from "./types/video";
import { Transcript } from "./types/transcript";
import VideoUploader from "./components/VideoUploader";
import VideoPlayer from "./components/VideoPlayer";
import TranscriptPanel from "./components/TranscriptPanel";

const API_URL = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- Transcribe handler ---
  const handleTranscribe = useCallback(async () => {
    if (!video) return;
    setIsTranscribing(true);
    try {
      const res = await fetch(`${API_URL}/api/videos/${video.id}/transcribe`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      setTranscript(data as Transcript);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  }, [video]);

  // --- Seek video when a word is clicked ---
  const handleWordClick = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  }, []);

  // --- Reset when uploading a new video ---
  const handleNewVideo = (uploaded: UploadedVideo) => {
    setVideo(uploaded);
    setTranscript(null); // clear old transcript
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <h1 className="text-lg font-bold tracking-tight">AI Video Editor</h1>
        </div>
        {video && (
          <button
            onClick={() => { setVideo(null); setTranscript(null); }}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Upload Different Video
          </button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        {!video ? (
          <div className="w-full max-w-2xl text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Edit short-form videos by editing text
              </h2>
              <p className="text-slate-400">
                Upload a raw clip to transcribe, cut dead air, and add animated captions.
              </p>
            </div>
            <VideoUploader onUploadSuccess={handleNewVideo} />
          </div>
        ) : (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-6rem)]">
            {/* LEFT: Transcript */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <TranscriptPanel
                words={transcript?.words ?? []}
                isTranscribing={isTranscribing}
                onTranscribe={handleTranscribe}
                onWordClick={handleWordClick}
                videoRef={videoRef}
              />
            </div>

            {/* RIGHT: Video Player */}
            <div className="lg:col-span-5">
              <VideoPlayer video={video} videoRef={videoRef} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}