import { useState } from "react";
import { UploadedVideo } from "../types/video";

const API_URL = import.meta.env.VITE_API_URL as string;

interface VideoUploaderProps {
  onUploadSuccess: (video: UploadedVideo) => void;
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (.mp4, .mov, .webm).");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // FormData packages binary files into multipart/form-data
      const formData = new FormData();
      formData.append("video", file); // "video" MUST match upload.single("video") on the server

      const res = await fetch(`${API_URL}/api/videos/upload`, {
        method: "POST",
        body: formData,
        // IMPORTANT: Do NOT set Content-Type header manually here!
        // The browser must set it automatically so it includes the multipart boundary string.
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadSuccess(data as UploadedVideo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer transition ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900"
        }`}
      >
        <div className="flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 mb-4 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl">
            ↑
          </div>
          {isUploading ? (
            <p className="text-lg font-medium text-indigo-400 animate-pulse">
              Uploading video...
            </p>
          ) : (
            <>
              <p className="mb-2 text-lg font-semibold text-slate-200">
                Drop your raw video here, or{" "}
                <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-sm text-slate-400">
                MP4, MOV, or WebM (up to 200MB • short-form 30s–3min ideal)
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}