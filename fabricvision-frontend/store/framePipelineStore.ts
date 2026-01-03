import { create } from "zustand";

export type ForwardedFrame = {
  id: number;
  image: string | null;
  fis: number;
  threshold: number;
  frame_type: "borderline" | "irregular";
};

interface FramePipelineState {
  forwardedFrames: ForwardedFrame[];
  addFrame: (frame: ForwardedFrame) => void;
  clearFrames: () => void;
}

export const useFramePipelineStore = create<FramePipelineState>((set) => ({
  forwardedFrames: [],
  addFrame: (frame) =>
    set((state) => ({
      forwardedFrames: [...state.forwardedFrames, frame],
    })),
  clearFrames: () => set({ forwardedFrames: [] }),
}));
