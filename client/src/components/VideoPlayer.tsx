import { UploadedVideo } from "../types/video";

const API_URL = import.meta.env.VITE_API_URL as string;

interface VideoPlayerProps {
  video: UploadedVideo;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const sizeInMB = (video.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-medium text-slate-300 truncate max-w-xs">
          {video.originalName}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
          {sizeInMB} MB
        </span>
      </div>

      {/* Preview stage */}
      <div className="w-full flex justify-center bg-black rounded-xl overflow-hidden">
        <video
          src={`${API_URL}${video.url}`}
          controls
          className="max-h-[65vh] w-auto"
        />
      </div>
    </div>
  );
}