import requests
import time
import threading

# When deployed change to laptop IP
COMPONENT3_URL = "http://127.0.0.1:9000/receive-enhanced-frame"

SEND_INTERVAL = 0.5  # seconds (2 FPS)

_last_sent_time = 0
_lock = threading.Lock()


def send_enhanced_frame(image_bytes: bytes):
    """
    Fire-and-forget sender.
    Sends enhanced frames periodically.
    Does NOT wait for defect result.
    """

    global _last_sent_time

    current_time = time.time()

    with _lock:
        if current_time - _last_sent_time < SEND_INTERVAL:
            return  # Skip sending (rate limited)

        _last_sent_time = current_time

    try:
        files = {
            "file": ("enhanced.jpg", image_bytes, "image/jpeg")
        }

        # timeout small because we don't care about response
        requests.post(
            COMPONENT3_URL,
            files=files,
            timeout=2
        )

    except Exception as e:
        # Don't crash system if laptop offline
        print("⚠ Component 3 not reachable:", e)
