# After fixed metrics error
import cv2
import numpy as np


class FabricEnhancer:
    def __init__(self):
        pass

    # =====================================================
    # MAIN ENTRY (used by API)
    # =====================================================
    def enhance_by_class(self, image: np.ndarray, fabric_class: str):
        fc = (fabric_class or "").lower().strip()

        if fc == "dark":
            enhanced = self._enhance_dark(image)
            params = {
                "profile": "dark",
                "clahe_clip": 3.0,
                "gamma": 0.7,
                "sharpen_strength": 1.0,
            }

        elif fc == "light":
            enhanced = self._enhance_light(image)
            params = {
                "profile": "light",
                "alpha": 0.9,
                "beta": -10,
                "bilateral_filter": True,
            }

        elif fc == "patterned":
            enhanced = self._enhance_patterned(image)
            params = {
                "profile": "patterned",
                "edge_preserve": True,
                "sharpen_strength": 0.6,
            }

        else:
            enhanced = image
            params = {"profile": "none"}

        return enhanced, params

    # =====================================================
    # METRICS COMPUTATION (REAL ANALYTICS)
    # =====================================================
    def compute_metrics(self, before_bgr: np.ndarray, after_bgr: np.ndarray):
        before_gray = cv2.cvtColor(before_bgr, cv2.COLOR_BGR2GRAY)
        after_gray = cv2.cvtColor(after_bgr, cv2.COLOR_BGR2GRAY)

        # ---------- basic measures ----------
        def brightness(g):
            return float(np.mean(g))

        def contrast(g):
            return float(np.std(g))

        def sharpness(g):
            return float(cv2.Laplacian(g, cv2.CV_64F).var())

        # ---------- composite quality ----------
        def quality(br, ct, sh):
            br_n = min(max(br / 255.0, 0.0), 1.0)
            ct_n = min(ct, 128.0) / 128.0
            sh_n = min(sh, 1000.0) / 1000.0
            return float((0.2 * br_n + 0.4 * ct_n + 0.4 * sh_n) * 100.0)

        # ---------- before ----------
        b_b = brightness(before_gray)
        c_b = contrast(before_gray)
        s_b = sharpness(before_gray)
        q_b = quality(b_b, c_b, s_b)

        # ---------- after ----------
        b_a = brightness(after_gray)
        c_a = contrast(after_gray)
        s_a = sharpness(after_gray)
        q_a = quality(b_a, c_a, s_a)

        # ---------- deltas ----------
        delta_quality_pct = ((q_a - q_b) / max(q_b, 1e-6)) * 100.0
        delta_sharpness_pct = ((s_a - s_b) / max(s_b, 1e-6)) * 100.0
        delta_noise_pct = ((c_b - c_a) / max(c_b, 1e-6)) * 100.0

        return {
            "before": {
                "brightness": round(b_b, 2),
                "contrast": round(c_b, 2),
                "sharpness": round(s_b, 2),
                "quality": round(q_b, 2),
            },
            "after": {
                "brightness": round(b_a, 2),
                "contrast": round(c_a, 2),
                "sharpness": round(s_a, 2),
                "quality": round(q_a, 2),
            },
            "delta": {
                "brightness": round(b_a - b_b, 2),
                "contrast": round(c_a - c_b, 2),
                "sharpness": round(s_a - s_b, 2),
                "quality": round(q_a - q_b, 2),
            },
            "delta_pct": {
                "quality_gain_pct": round(delta_quality_pct, 2),
                "sharpness_gain_pct": round(delta_sharpness_pct, 2),
                "noise_reduction_pct": round(delta_noise_pct, 2),
            },
        }

    # =====================================================
    # REGION CONTRIBUTION (LEFT / CENTER / RIGHT)
    # =====================================================
    # def region_contribution(self, before_bgr: np.ndarray, after_bgr: np.ndarray):
    #     h, w = before_bgr.shape[:2]

    #     before_gray = cv2.cvtColor(before_bgr, cv2.COLOR_BGR2GRAY)
    #     after_gray = cv2.cvtColor(after_bgr, cv2.COLOR_BGR2GRAY)

    #     thirds = [(0, w // 3), (w // 3, 2 * w // 3), (2 * w // 3, w)]
    #     names = ["Left Warp", "Center Weave", "Right Warp"]

    #     regions = []

    #     for (x0, x1), name in zip(thirds, names):
    #         b_roi = before_gray[:, x0:x1]
    #         a_roi = after_gray[:, x0:x1]

    #         s_b = float(cv2.Laplacian(b_roi, cv2.CV_64F).var())
    #         s_a = float(cv2.Laplacian(a_roi, cv2.CV_64F).var())

    #         improvement = max(s_a - s_b, 0.0)

    #         regions.append({
    #             "region": name,
    #             "contribution": round(min(improvement / 20.0, 1.0) * 100, 1)
    #         })

    #     return regions
    def region_contribution(self, before_bgr: np.ndarray, after_bgr: np.ndarray):
        h, w = before_bgr.shape[:2]

        before_gray = cv2.cvtColor(before_bgr, cv2.COLOR_BGR2GRAY)
        after_gray = cv2.cvtColor(after_bgr, cv2.COLOR_BGR2GRAY)

        thirds = [(0, w // 3), (w // 3, 2 * w // 3), (2 * w // 3, w)]
        names = ["Left Warp", "Center Weave", "Right Warp"]

        raw = []
        for (x0, x1), name in zip(thirds, names):
            b_roi = before_gray[:, x0:x1]
            a_roi = after_gray[:, x0:x1]

            s_b = float(cv2.Laplacian(b_roi, cv2.CV_64F).var())
            s_a = float(cv2.Laplacian(a_roi, cv2.CV_64F).var())

            improvement = s_a - s_b  # keep sign for analysis
            raw.append({
                "region": name,
                "sharpness_before": round(s_b, 2),
                "sharpness_after": round(s_a, 2),
                "improvement": round(improvement, 2),
            })

        # Normalize using absolute improvements (avoid negative cancelling)
        total = sum(max(0.0, abs(r["improvement"])) for r in raw)

        for r in raw:
            val = max(0.0, abs(r["improvement"]))
            pct = (val / total * 100.0) if total > 1e-6 else 0.0
            r["contribution"] = round(pct, 1)

        return raw


    # =====================================================
    # ENHANCEMENT METHODS
    # =====================================================
    def _enhance_dark(self, img):
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)

        lab = cv2.merge((l, a, b))
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

        img = self._gamma_correction(img, gamma=0.7)
        img = self._sharpen(img, strength=1.0)
        return img

    def _enhance_light(self, img):
        img = cv2.convertScaleAbs(img, alpha=0.9, beta=-10)
        img = cv2.bilateralFilter(img, 9, 75, 75)
        return img

    def _enhance_patterned(self, img):
        img = cv2.edgePreservingFilter(img, flags=1, sigma_s=60, sigma_r=0.4)
        img = self._sharpen(img, strength=0.6)
        return img

    # =====================================================
    # UTILITIES
    # =====================================================
    def _gamma_correction(self, img, gamma=1.0):
        inv_gamma = 1.0 / gamma
        table = np.array([
            ((i / 255.0) ** inv_gamma) * 255 for i in range(256)
        ]).astype("uint8")
        return cv2.LUT(img, table)

    def _sharpen(self, img, strength=1.0):
        kernel = np.array([
            [0, -1, 0],
            [-1, 5 + strength, -1],
            [0, -1, 0]
        ])
        return cv2.filter2D(img, -1, kernel)
