import { useEffect, useRef, useState } from "react";
import { TranscriptWord } from "../types/transcript";

interface TranscriptPanelProps {
  words: TranscriptWord[];
  isTranscribing: boolean;
  onTranscribe: () => void;
  onWordClick: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function TranscriptPanel({
  words,
  isTranscribing,
  onTranscribe,
  onWordClick,
  videoRef,
}: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which word is currently "active" based on video playback time
  const [activeWordId, setActiveWordId] = useState<number>(-1);

  // Listen to the video's timeupdate event (fires ~4x per second)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || words.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      // Find the word whose [start, end) range contains currentTime
      const active = words.find((w) => currentTime >= w.start && currentTime < w.end);
      setActiveWordId(active ? active.id : -1);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoRef, words]);

  // Auto-scroll to keep the active word visible
  useEffect(() => {
    if (activeWordId === -1 || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-word-id="${activeWordId}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeWordId]);

  // --- Empty state: show the Transcribe button ---
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Transcribe your video to start editing by text.
        </p>
        <button
          onClick={onTranscribe}
          disabled={isTranscribing}
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white transition"
        >
          {isTranscribing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Transcribing...
            </span>
          ) : (
            "✨ Transcribe Video"
          )}
        </button>
      </div>
    );
  }

  // --- Transcript view: clickable words ---
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 space-y-1"
    >
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">
        Transcript — click a word to seek
      </p>
      <div className="leading-relaxed text-[15px]">
        {words.map((word) => (
          <span
            key={word.id}
            data-word-id={word.id}
            onClick={() => onWordClick(word.start)}
            className={`cursor-pointer rounded px-0.5 transition-colors ${
              activeWordId === word.id
                ? "bg-indigo-500/40 text-white"
                : "text-slate-300 hover:bg-slate-700/60"
            }`}
          >
            {word.word}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}