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