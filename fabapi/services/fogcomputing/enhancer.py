import cv2
import numpy as np

class FabricEnhancer:
    def __init__(self):
        pass

    # -------------------------
    # Public API
    # -------------------------
    def enhance(self, image: np.ndarray, fabric_class: str) -> np.ndarray:
        if fabric_class == "dark":
            return self._enhance_dark(image)
        elif fabric_class == "light":
            return self._enhance_light(image)
        elif fabric_class == "patterned":
            return self._enhance_patterned(image)
        else:
            return image  # fallback

    # -------------------------
    # DARK FABRIC
    # -------------------------
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

    # -------------------------
    # LIGHT FABRIC
    # -------------------------
    def _enhance_light(self, img):
        img = cv2.convertScaleAbs(img, alpha=0.9, beta=-10)
        img = cv2.bilateralFilter(img, 9, 75, 75)
        return img

    # -------------------------
    # PATTERNED FABRIC
    # -------------------------
    def _enhance_patterned(self, img):
        smoothed = cv2.edgePreservingFilter(
            img, flags=1, sigma_s=60, sigma_r=0.4
        )
        smoothed = self._sharpen(smoothed, strength=0.6)
        return smoothed

    # -------------------------
    # Utilities
    # -------------------------
    def _gamma_correction(self, img, gamma=1.0):
        invGamma = 1.0 / gamma
        table = np.array([
            ((i / 255.0) ** invGamma) * 255
            for i in range(256)
        ]).astype("uint8")

        return cv2.LUT(img, table)

    def _sharpen(self, img, strength=1.0):
        kernel = np.array([
            [0, -1, 0],
            [-1, 5 + strength, -1],
            [0, -1, 0]
        ])
        return cv2.filter2D(img, -1, kernel)
