import { describe, it, expect } from "vitest";
import type { TranscriptWord } from "../types/transcript";
import { computeKeptSegments, getEditedDuration, getPlaybackAction } from "./edits";

// A fake 3.5-second transcript. Word 1 ("um") is the one we'll delete.
const words: TranscriptWord[] = [
  { id: 0, word: "Hello", start: 0.0, end: 1.0 },
  { id: 1, word: "um", start: 1.0, end: 1.5 },
  { id: 2, word: "there", start: 1.5, end: 2.5 },
  { id: 3, word: "friends", start: 2.5, end: 3.5 },
];

describe("computeKeptSegments", () => {
  it("keeps everything when nothing is deleted", () => {
    expect(computeKeptSegments(words, new Set())).toEqual([{ start: 0, end: 3.5 }]);
  });

  it("splits the timeline when a middle word is deleted", () => {
    expect(computeKeptSegments(words, new Set([1]))).toEqual([
      { start: 0, end: 1 },
      { start: 1.5, end: 3.5 },
    ]);
  });

  it("handles deleting the first word", () => {
    expect(computeKeptSegments(words, new Set([0]))).toEqual([{ start: 1, end: 3.5 }]);
  });

  it("returns nothing when every word is deleted", () => {
    expect(computeKeptSegments(words, new Set([0, 1, 2, 3]))).toEqual([]);
  });
});

describe("getEditedDuration", () => {
  it("adds up the kept segments", () => {
    const segments = computeKeptSegments(words, new Set([1]));
    expect(getEditedDuration(segments)).toBeCloseTo(3.0); // 1.0 + 2.0
  });
});

describe("getPlaybackAction", () => {
  // Deleting "um" leaves [0, 1) and [1.5, 3.5)
  const segments = computeKeptSegments(words, new Set([1]));

  it("plays while inside a kept segment", () => {
    expect(getPlaybackAction(0.5, segments)).toEqual({ type: "play" });
  });

  it("jumps over a removed gap to the next kept segment", () => {
    expect(getPlaybackAction(1.2, segments)).toEqual({ type: "seek", to: 1.5 });
  });

  it("treats a segment's start as inside and its end as outside", () => {
    expect(getPlaybackAction(1.5, segments)).toEqual({ type: "play" }); // exactly at start
    expect(getPlaybackAction(1.0, segments)).toEqual({ type: "seek", to: 1.5 }); // exactly at end
  });

  it("ends once playback passes the last kept segment", () => {
    expect(getPlaybackAction(3.6, segments)).toEqual({ type: "end" });
  });

  it("skips a deleted opening word right away", () => {
    const noIntro = computeKeptSegments(words, new Set([0])); // [1, 3.5)
    expect(getPlaybackAction(0, noIntro)).toEqual({ type: "seek", to: 1 });
  });
});