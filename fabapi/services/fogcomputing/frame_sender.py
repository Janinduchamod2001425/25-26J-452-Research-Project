# import requests
# import time
# import threading
# import uuid

# # Change this when deployed
# COMPONENT3_URL = "http://127.0.0.1:9000/receive-enhanced-frame"

# SEND_INTERVAL = 0.5  # seconds (2 FPS)

# _last_sent_time = 0
# _lock = threading.Lock()


# def _async_send(image_bytes: bytes, frame_id: str, timestamp: float):
#     """
#     Background sender thread.
#     Does NOT block main FastAPI thread.
#     """
#     try:
#         files = {
#             "file": ("enhanced.jpg", image_bytes, "image/jpeg")
#         }

#         data = {
#             "frame_id": frame_id,
#             "timestamp": timestamp
#         }

#         requests.post(
#             COMPONENT3_URL,
#             files=files,
#             data=data,
#             timeout=2
#         )

#     except Exception as e:
#         print("⚠ Component 3 not reachable:", e)


# def send_enhanced_frame(image_bytes: bytes):
#     """
#     Production-ready fire-and-forget sender.
#     Rate limited + background thread.
#     """

#     global _last_sent_time

#     current_time = time.time()

#     with _lock:
#         if current_time - _last_sent_time < SEND_INTERVAL:
#             return  # Skip sending (rate limited)

#         _last_sent_time = current_time

#     # Create metadata
#     frame_id = str(uuid.uuid4())
#     timestamp = current_time

#     # Launch background thread
#     thread = threading.Thread(
#         target=_async_send,
#         args=(image_bytes, frame_id, timestamp),
#         daemon=True
#     )
#     thread.start()


#new one
import requests
import threading
import time

# Component 3 endpoint
COMPONENT3_URL = "http://127.0.0.1:9000/receive-enhanced-frame"


def _async_send(image_bytes: bytes, frame_name: str, timestamp: float):
    """
    Send frame to Component 3 asynchronously.
    """

    try:

        files = {
            "file": (frame_name, image_bytes, "image/jpeg")
        }

        data = {
            "frame_name": frame_name,
            "timestamp": timestamp
        }

        requests.post(
            COMPONENT3_URL,
            files=files,
            data=data,
            timeout=5
        )

    except Exception as e:
        print("⚠ Component 3 not reachable:", e)


def send_enhanced_frame(image_bytes: bytes, frame_name: str):
    """
    Send enhanced frame to Component 3 without blocking pipeline.
    """

    timestamp = time.time()

    thread = threading.Thread(
        target=_async_send,
        args=(image_bytes, frame_name, timestamp),
        daemon=True
    )

    thread.start()