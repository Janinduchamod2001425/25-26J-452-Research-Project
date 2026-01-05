import { create } from "zustand";

export type MotionPrediction = "active" | "idle";
export type FrameType = "borderline" | "irregular";

export interface QualityAssessment {
  frame_quality: "good" | "poor";
  risk_level: "low" | "high" | "critical";
  action: "continue" | "alert_operator";
  confidence_reason: string[];
}

export interface DemoFrame {
  id: number;
  image: string; // for preview (public path or blob URL)
  frame_type: FrameType;
  fis: number;
  threshold: number;

  motion: {
    prediction: MotionPrediction;
    confidence: number;
  };

  // API output
  assessment?: QualityAssessment;

  // FE routing decision (demo)
  route?: "to_fog" | "to_next_component" | "hold_drop";
}

type ScenarioKey =
  | "GOOD_CAPTURE"
  | "HIGH_SPEED_MOTION"
  | "POOR_LIGHTING"
  | "MIXED_ROLL";

interface Novelty3State {
  frames: DemoFrame[];
  currentIndex: number;
  isAssessing: boolean;
  lastError: string | null;

  // Counters (computed once after changes)
  stats: {
    total: number;
    borderline: number;
    irregular: number;
    good: number;
    poor: number;
    forwardedToFog: number;
    forwardedToNext: number;
    heldDropped: number;
    alerts: number;
  };

  setCurrentIndex: (idx: number) => void;
  clearAll: () => void;

  addSingleFrame: (partial?: Partial<DemoFrame>) => Promise<void>;
  addScenarioBatch: (scenario: ScenarioKey, count?: number) => Promise<void>;
}

const API_URL = "http://127.0.0.1:8000/quality/assess";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function round3(v: number) {
  return Math.round(v * 1000) / 1000;
}

function computeRouting(assessment?: QualityAssessment): DemoFrame["route"] {
  // Demo routing rules (panel-friendly):
  // - Critical/alert => Hold/Drop + operator alert (not safe for detection)
  // - Poor/high => Send to Fog enhancement (try to improve frame quality)
  // - Good/low => Forward to next component (defect detection)
  if (!assessment) return undefined;

  if (
    assessment.action === "alert_operator" ||
    assessment.risk_level === "critical"
  ) {
    return "hold_drop";
  }
  if (assessment.frame_quality === "poor" || assessment.risk_level === "high") {
    return "to_fog";
  }
  return "to_next_component";
}

async function assessFrame(frame: DemoFrame): Promise<QualityAssessment> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      motion: {
        prediction: frame.motion.prediction,
        confidence: frame.motion.confidence,
      },
      frame_analysis: {
        frame_type: frame.frame_type,
        fis: frame.fis,
        threshold: frame.threshold,
      },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Quality assess failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data.quality_assessment as QualityAssessment;
}

function recomputeStats(frames: DemoFrame[]) {
  const stats = {
    total: frames.length,
    borderline: 0,
    irregular: 0,
    good: 0,
    poor: 0,
    forwardedToFog: 0,
    forwardedToNext: 0,
    heldDropped: 0,
    alerts: 0,
  };

  for (const f of frames) {
    if (f.frame_type === "borderline") stats.borderline++;
    if (f.frame_type === "irregular") stats.irregular++;

    if (f.assessment?.frame_quality === "good") stats.good++;
    if (f.assessment?.frame_quality === "poor") stats.poor++;

    if (f.route === "to_fog") stats.forwardedToFog++;
    if (f.route === "to_next_component") stats.forwardedToNext++;
    if (f.route === "hold_drop") stats.heldDropped++;

    if (f.assessment?.action === "alert_operator") stats.alerts++;
  }

  return stats;
}

function makeDefaultFrame(partial?: Partial<DemoFrame>): DemoFrame {
  const id = Date.now() + Math.floor(Math.random() * 999);

  const threshold = partial?.threshold ?? round3(0.28 + Math.random() * 0.08); // ~0.28–0.36
  const frame_type: FrameType =
    partial?.frame_type ?? (Math.random() > 0.6 ? "irregular" : "borderline");

  // Make fis consistent with frame_type
  const fis =
    partial?.fis ??
    (frame_type === "borderline"
      ? round3(threshold * (1.05 + Math.random() * 0.25)) // slightly above threshold
      : round3(threshold * (1.5 + Math.random() * 0.6))); // well above threshold

  const motionPred: MotionPrediction =
    partial?.motion?.prediction ?? (Math.random() > 0.65 ? "active" : "idle");
  const motionConf =
    partial?.motion?.confidence ??
    round3(
      clamp01(
        motionPred === "active"
          ? 0.65 + Math.random() * 0.35
          : 0.2 + Math.random() * 0.4,
      ),
    );

  return {
    id,
    image: partial?.image ?? "/assets/LivePreview.jpeg",
    frame_type,
    fis,
    threshold,
    motion: { prediction: motionPred, confidence: motionConf },
    assessment: partial?.assessment,
    route: partial?.route,
  };
}

function makeScenarioFrames(scenario: ScenarioKey, count: number): DemoFrame[] {
  const out: DemoFrame[] = [];

  for (let i = 0; i < count; i++) {
    if (scenario === "GOOD_CAPTURE") {
      // mostly borderline, low motion
      out.push(
        makeDefaultFrame({
          frame_type: Math.random() > 0.85 ? "irregular" : "borderline",
          motion: {
            prediction: "idle",
            confidence: round3(0.25 + Math.random() * 0.35),
          },
        }),
      );
      continue;
    }

    if (scenario === "HIGH_SPEED_MOTION") {
      // more irregular + active motion (triggers critical often)
      out.push(
        makeDefaultFrame({
          frame_type: Math.random() > 0.35 ? "irregular" : "borderline",
          motion: {
            prediction: "active",
            confidence: round3(0.75 + Math.random() * 0.25),
          },
        }),
      );
      continue;
    }

    if (scenario === "POOR_LIGHTING") {
      // irregular/borderline with mixed motion; slightly higher fis
      const base = makeDefaultFrame({
        frame_type: Math.random() > 0.45 ? "irregular" : "borderline",
        motion: {
          prediction: Math.random() > 0.5 ? "active" : "idle",
          confidence: round3(0.55 + Math.random() * 0.4),
        },
      });
      out.push({
        ...base,
        fis: round3(base.fis * (1.05 + Math.random() * 0.2)),
      });
      continue;
    }

    // MIXED_ROLL
    out.push(
      makeDefaultFrame({
        frame_type: Math.random() > 0.55 ? "borderline" : "irregular",
        motion: {
          prediction: Math.random() > 0.6 ? "active" : "idle",
          confidence: round3(0.45 + Math.random() * 0.5),
        },
      }),
    );
  }

  return out;
}

export const useNovelty3DemoStore = create<Novelty3State>((set, get) => ({
  frames: [],
  currentIndex: 0,
  isAssessing: false,
  lastError: null,

  stats: {
    total: 0,
    borderline: 0,
    irregular: 0,
    good: 0,
    poor: 0,
    forwardedToFog: 0,
    forwardedToNext: 0,
    heldDropped: 0,
    alerts: 0,
  },

  setCurrentIndex: (idx) =>
    set((state) => ({
      currentIndex: Math.max(0, Math.min(idx, state.frames.length - 1)),
    })),

  clearAll: () =>
    set({
      frames: [],
      currentIndex: 0,
      lastError: null,
      stats: {
        total: 0,
        borderline: 0,
        irregular: 0,
        good: 0,
        poor: 0,
        forwardedToFog: 0,
        forwardedToNext: 0,
        heldDropped: 0,
        alerts: 0,
      },
    }),

  addSingleFrame: async (partial) => {
    set({ isAssessing: true, lastError: null });

    try {
      const frame = makeDefaultFrame(partial);
      const assessment = await assessFrame(frame);
      const route = computeRouting(assessment);

      set((state) => {
        const updated = [...state.frames, { ...frame, assessment, route }];
        return {
          frames: updated,
          currentIndex: updated.length - 1,
          isAssessing: false,
          stats: recomputeStats(updated),
        };
      });
    } catch (e: any) {
      set({ isAssessing: false, lastError: e?.message ?? "Unknown error" });
    }
  },

  addScenarioBatch: async (scenario, count = 25) => {
    set({ isAssessing: true, lastError: null });

    try {
      const batch = makeScenarioFrames(scenario, count);

      // assess sequentially (safer for demo). If you want faster, we can Promise.all later.
      const assessed: DemoFrame[] = [];
      for (const f of batch) {
        const assessment = await assessFrame(f);
        assessed.push({ ...f, assessment, route: computeRouting(assessment) });
      }

      set((state) => {
        const updated = [...state.frames, ...assessed];
        return {
          frames: updated,
          currentIndex: updated.length - 1,
          isAssessing: false,
          stats: recomputeStats(updated),
        };
      });
    } catch (e: any) {
      set({ isAssessing: false, lastError: e?.message ?? "Unknown error" });
    }
  },
}));
