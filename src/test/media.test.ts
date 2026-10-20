import { describe, it, expect } from "vitest";
import { analysisSchema, audioFormat, parsePrompt, streamDelta } from "@/lib/media";

describe("no-signup media analysis", () => {
  it("accepts image uploads without account fields", () => {
    expect(analysisSchema.safeParse({ kind: "image", images: ["data:image/jpeg;base64,YWJjZA=="] }).success).toBe(true);
  });
  it("accepts ringtone audio including m4r containers", () => {
    expect(audioFormat({ type: "", name: "ringtone.m4r" })).toBe("m4a");
    expect(analysisSchema.safeParse({ kind: "audio", audio: "YWJjZA==", format: "mp3" }).success).toBe(true);
  });
  it("continues accepting video frames", () => {
    expect(analysisSchema.safeParse({ kind: "video", images: ["data:image/jpeg;base64,YWJjZA=="] }).success).toBe(true);
  });
  it("rejects empty or unsupported media", () => {
    expect(analysisSchema.safeParse({ kind: "audio", audio: "", format: "exe" }).success).toBe(false);
  });
  it("reads both image and audio text deltas", () => {
    expect(streamDelta({ type: "response.output_text.delta", delta: "portrait" })).toBe("portrait");
    expect(streamDelta({ choices: [{ delta: { content: "melody" } }] })).toBe("melody");
  });
  it("stops denied or refused requests", () => {
    expect(() => streamDelta({ type: "denied", message: "Access denied" })).toThrow("Access denied");
    expect(() => streamDelta({ choices: [{ delta: { refusal: "Cannot analyze" } }] })).toThrow("Cannot analyze");
  });
  it("separates the prompt from negative guidance", () => {
    expect(parsePrompt("PROMPT:\nPiano ringtone\nNEGATIVE:\nDistortion\nSTYLE: Piano\nTAGS: soft, loop").prompt).toBe("Piano ringtone");
  });
});