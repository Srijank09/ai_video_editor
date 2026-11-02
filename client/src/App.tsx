import { useState } from "react";
import { UploadedVideo } from "./types/video";
import VideoUploader from "./components/VideoUploader";
import VideoPlayer from "./components/VideoPlayer";

export default function App() {
  // Union type: `video` starts as null, then holds an UploadedVideo object
  const [video, setVideo] = useState<UploadedVideo | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <h1 className="text-lg font-bold tracking-tight">AI Video Editor</h1>
        </div>

        {video && (
          <button
            onClick={() => setVideo(null)}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Upload Different Video
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {!video ? (
          <div className="w-full max-w-2xl text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Edit short-form videos by editing text
              </h2>
              <p className="text-slate-400">
                Upload a raw clip to transcribe, cut dead air, and add animated
                captions.
              </p>
            </div>
            <VideoUploader onUploadSuccess={(uploaded) => setVideo(uploaded)} />
          </div>
        ) : (
          /* 2-Column Editor Workspace */
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Transcript Editor (Phase 2) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px] flex flex-col justify-center items-center text-center">
              <p className="text-slate-300 font-semibold text-lg mb-1">
                Transcript Panel Ready
              </p>
              <p className="text-slate-500 text-sm max-w-sm">
                Next up in Phase 2: AI word-level transcription will appear here
                for text-based video cutting.
              </p>
            </div>

            {/* Right Panel: Video Preview */}
            <div className="lg:col-span-5">
              <VideoPlayer video={video} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}