import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [response, setResponse] = useState("Click the button to call the API");

  async function ping() {
    const res = await fetch(`${API_URL}/api/health`);
    const data = await res.json();
    setResponse(JSON.stringify(data));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">AI Video Editor</h1>
      <button
        onClick={ping}
        className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold"
      >
        Ping API
      </button>
      <p className="text-slate-400 font-mono">{response}</p>
    </div>
  );
}