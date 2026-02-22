# this code will save fabric state in a global state - sliding window(majoraty vote) - show result in the fabric level in the frotnend not the frame by frame

from collections import deque, Counter, defaultdict
from datetime import datetime

WINDOW_SIZE = 30  # last 30 frames (~1–2 seconds depending on FPS)


class FabricStateManager:
    def __init__(self):
        self.buffer = deque(maxlen=WINDOW_SIZE)
        self.latest_frame_timestamp = None

    def update(self, pattern_label, pattern_type, color_info):
        """
        color_info must contain:
        {
            "dominant_color": str,
            "secondary_color": str,
            "distribution": [
                {"color": str, "ratio": float},
                ...
            ]
        }
        """
        self.buffer.append({
            "pattern": pattern_label,
            "pattern_type": pattern_type,
            "dominant_color": color_info.get("dominant_color"),
            "secondary_color": color_info.get("secondary_color"),
            "distribution": color_info.get("distribution", [])
        })

        self.latest_frame_timestamp = datetime.utcnow()

    def get_stable_state(self):
        if not self.buffer:
            return None

        # -------------------------
        # Pattern Aggregation
        # -------------------------
        patterns = [f["pattern"] for f in self.buffer]
        types = [f["pattern_type"] for f in self.buffer]

        stable_pattern = Counter(patterns).most_common(1)[0][0]
        stable_type = Counter(types).most_common(1)[0][0]

        # -------------------------
        # Color Aggregation
        # -------------------------

        dominant_colors = [f["dominant_color"] for f in self.buffer if f["dominant_color"]]
        secondary_colors = [f["secondary_color"] for f in self.buffer if f["secondary_color"]]

        stable_dominant = Counter(dominant_colors).most_common(1)[0][0] if dominant_colors else None
        stable_secondary = Counter(secondary_colors).most_common(1)[0][0] if secondary_colors else None

        # -------------------------
        # Distribution Aggregation
        # Average ratios across window
        # -------------------------
        color_accumulator = defaultdict(float)

        for frame in self.buffer:
            for c in frame["distribution"]:
                color_accumulator[c["color"]] += c["ratio"]

        # average across window size
        distribution = []
        total_frames = len(self.buffer)

        for color, total_ratio in color_accumulator.items():
            distribution.append({
                "color": color,
                "ratio": total_ratio / total_frames
            })

        # sort descending
        distribution = sorted(distribution, key=lambda x: x["ratio"], reverse=True)

        return {
            "pattern": stable_pattern,
            "pattern_type": stable_type,
            "dominant_color": stable_dominant,
            "secondary_color": stable_secondary,
            "color_distribution": distribution,
            "window_size": total_frames,
            "last_update": self.latest_frame_timestamp
        }