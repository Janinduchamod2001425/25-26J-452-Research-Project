import os
import time
import base64
from pathlib import Path
from typing import Optional

from fabapi.services.fogcomputing.tflite_model_service import predict_patterned, predict_pattern_type
from fabapi.services.fogcomputing.enhancer import enhance_with_metadata, RunningStats
from fabapi.services.fogcomputing.status_utils import quality_score_0_100, build_alerts
from fabapi.services.fogcomputing.state import APP_START_TIME, LATEST_STATUS, update_status
from fabapi.services.fogcomputing.frame_sender import send_enhanced_frame

QUALITY_STATS = RunningStats(alpha=0.12)


class FolderPipeline:
    def __init__(
        self,
        captured_dir: str,
        enhanced_dir: str,
        poll_interval: float = 0.15,
        send_to_component3: bool = True,
        write_enhanced_to_disk: bool = True,
    ):
        self.captured_dir = Path(captured_dir)
        self.enhanced_dir = Path(enhanced_dir)
        self.poll_interval = float(poll_interval)
        self.send_to_component3 = bool(send_to_component3)
        self.write_enhanced_to_disk = bool(write_enhanced_to_disk)

        self.captured_dir.mkdir(parents=True, exist_ok=True)
        self.enhanced_dir.mkdir(parents=True, exist_ok=True)

        self._seen = set()
        self._running = False

        self.frames_processed = 0

    def _list_new_frames(self):
        # only jpg/jpeg/png
        files = sorted(self.captured_dir.glob("*.jpg")) + sorted(self.captured_dir.glob("*.jpeg")) + sorted(self.captured_dir.glob("*.png"))
        for p in files:
            if str(p) not in self._seen:
                yield p

    def _read_bytes_safely(self, path: Path, retries: int = 5, delay: float = 0.05) -> Optional[bytes]:
        # sometimes capture script still writing file — wait a bit
        for _ in range(retries):
            try:
                data = path.read_bytes()
                if len(data) > 5000:  # basic sanity
                    return data
            except Exception:
                pass
            time.sleep(delay)
        return None

    def _build_enhanced_name(self, original_name: str, patterned: str, ptype: str, score: float) -> str:
        stem = Path(original_name).stem
        # Example: frame_000142_pi3542_d2.71m_2026-02-20_14-32-05__patterned_stripe__q82.3.jpg
        return f"{stem}__{patterned}_{ptype}__q{score:.1f}.jpg"

    def process_one(self, img_path: Path):
        start = time.time()
        image_bytes = self._read_bytes_safely(img_path)
        if not image_bytes:
            # mark seen so we don't loop forever on broken file
            self._seen.add(str(img_path))
            return

        # 1) Pattern vs non-pattern
        patterned_result = predict_patterned(image_bytes)
        patterned_label = patterned_result["label"]
        patterned_conf = float(patterned_result["confidence"])

        # 2) Pattern type if patterned
        if patterned_label == "patterned":
            pattern_type_result = predict_pattern_type(image_bytes)
            pattern_type_label = pattern_type_result["label"]
            pattern_type_conf = float(pattern_type_result["confidence"])
        else:
            pattern_type_result = {"label": "none", "confidence": 1.0, "top3": []}
            pattern_type_label = "none"
            pattern_type_conf = 1.0

        # 3) Enhance + metrics
        enh = enhance_with_metadata(
            image_bytes=image_bytes,
            patterned_label=patterned_label,
            pattern_type=pattern_type_label,
            stats=QUALITY_STATS
        )

        score = quality_score_0_100(enh["metrics_after"])
        alerts = build_alerts(patterned_conf, pattern_type_conf, score)

        enhanced_bytes = enh["enhanced_image_jpeg_bytes"]

        # 4) Save enhanced frame
        if self.write_enhanced_to_disk:
            out_name = self._build_enhanced_name(img_path.name, patterned_label, pattern_type_label, score)
            out_path = self.enhanced_dir / out_name
            out_path.write_bytes(enhanced_bytes)

        # 5) Send to Component 3 (defect detection)
        if self.send_to_component3:
            send_enhanced_frame(enhanced_bytes)

        # 6) Update status for dashboard polling
        latency_ms = (time.time() - start) * 1000.0
        self.frames_processed += 1

        uptime_sec = time.time() - APP_START_TIME
        fps = self.frames_processed / max(uptime_sec, 1e-6)

        # optional preview base64 (can disable if heavy)
        enhanced_b64 = base64.b64encode(enhanced_bytes).decode("utf-8")

        update_status({
            "timestamp": time.time(),
            "uptime_sec": uptime_sec,
            "fabric": {
                "patterned_label": patterned_label,
                "patterned_confidence": patterned_conf,
                "pattern_type": pattern_type_label,
                "pattern_type_confidence": pattern_type_conf,
            },
            "enhancement": {
                "strategy": enh["strategy"],
                "quality_score": score,
                "metrics_before": enh["metrics_before"],
                "metrics_after": enh["metrics_after"],
                "delta": enh["delta"],
            },
            "alerts": alerts,
            "performance": {
                "fps": fps,
                "latency_ms": latency_ms,
                "frames_processed": self.frames_processed,
            },
            "preview": {
                "enabled": True,
                "enhanced_image_base64": enhanced_b64,
            }
        })

        # mark as seen AFTER success
        self._seen.add(str(img_path))

    def run_forever(self):
        self._running = True
        while self._running:
            any_new = False
            for p in self._list_new_frames():
                any_new = True
                self.process_one(p)

            if not any_new:
                time.sleep(self.poll_interval)

    def stop(self):
        self._running = False
