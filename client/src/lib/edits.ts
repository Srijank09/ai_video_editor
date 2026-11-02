import type { TranscriptWord } from "../types/transcript";

/** A stretch of the ORIGINAL video, in seconds, that survives the edit. */
export interface Segment {
  start: number;
  end: number;
}

/**
 * What the player should do at a given moment.
 * The `type` field tells the variants apart (a "discriminated union").
 */
export type PlaybackAction =
  | { type: "play" } // inside a kept segment: keep playing
  | { type: "seek"; to: number } // inside a removed gap: jump to `to`
  | { type: "end" }; // past the last kept segment: the edit is finished

/**
 * Turns "which words are deleted" into "which time ranges survive".
 * Consecutive kept words merge into one segment.
 */
export function computeKeptSegments(
  words: TranscriptWord[],
  deletedIds: ReadonlySet<number>
): Segment[] {
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const word of words) {
    if (deletedIds.has(word.id)) {
      // A deleted word closes whichever segment was open
      if (current) {
        segments.push(current);
        current = null;
      }
      continue;
    }

    if (current) {
      current.end = word.end; // extend the open segment
    } else {
      current = { start: word.start, end: word.end }; // open a new segment
    }
  }

  if (current) segments.push(current); // close the last one if still open
  return segments;
}

/** Decides what the player should do when it reaches `time`. */
export function getPlaybackAction(time: number, segments: Segment[]): PlaybackAction {
  if (segments.length === 0) return { type: "end" };

  // Half-open ranges: a segment includes its start but not its end
  const insideKept = segments.some((seg) => time >= seg.start && time < seg.end);
  if (insideKept) return { type: "play" };

  // We're in a removed gap: jump to the next segment that starts after us
  const next = segments.find((seg) => seg.start > time);
  if (next) return { type: "seek", to: next.start };

  // Nothing kept lies ahead, so the edited video is over
  return { type: "end" };
}

/** Total length of the edited video, in seconds. */
export function getEditedDuration(segments: Segment[]): number {
  return segments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
}