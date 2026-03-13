# services/encoder/encoder_logic.py

import serial
import serial.tools.list_ports
import threading
import math
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import asyncio
from collections import deque
from pathlib import Path
import os

# ================= SETTINGS =================

# ================= SETTINGS =================
SERIAL_PORT = 'COM3'
BAUD_RATE = 115200
PPR = 1200
WHEEL_DIAMETER = 3.8
CIRCUMFERENCE = math.pi * WHEEL_DIAMETER
STOP_TIMEOUT = 2.0
HISTORY_SIZE = 200
PULSE_SAMPLE_INTERVAL = 0.1

SAVE_DIR = Path(r"E:\fabric_images\input")
SAVE_DIR.mkdir(parents=True, exist_ok=True)


class FabricEncoder:
    def __init__(self):
        self.data = {
            "pulses": 0,
            "cm": 0.0,
            "inches": 0.0,
            "status": "Waiting for connection...",
            "rotation": "Stopped",
            "last_update": datetime.now().strftime("%H:%M:%S"),
            "pulse_rate": 0.0,
            "current_pulse": 0,
            "average_pulse": 0.0,
            "peak_pulse": 0,
            "total_cm": 0.0,
            "total_inches": 0.0,
            "wheel_diameter": WHEEL_DIAMETER,
            "ppr": PPR,
            "circumference": CIRCUMFERENCE,
            "serial_connected": False,
            "available_ports": [],
            "motor_on": True
        }

        self.fabric_state = {
            "pattern": None,
            "pattern_type": None,
            "dominant_color": None,
            "secondary_color": None,
            "quality_score": None,
            "enhancement_mode": None,
            "frames_processed": 0,
            "fps": 0,
            "last_update": None,
            "last_image_saved": None
        }

        self.last_pulse_time = time.time()
        self.last_pulse_count = 0
        self.socketio = None
        self.running = False
        self.serial_connected = False
        self.ser = None
        self.thread = None

        self.pulse_history = deque(maxlen=HISTORY_SIZE)
        self.length_history = deque(maxlen=HISTORY_SIZE)
        self.time_history = deque(maxlen=HISTORY_SIZE)

        self.pulse_rate_samples = deque(maxlen=10)
        self.last_rate_calc_time = time.time()

        self.peak_pulse_rate = 0
        self.lock = threading.Lock()

    def set_socket(self, socket):
        self.socketio = socket
        print("Socket.IO instance set for encoder")

    def start(self):
        """Start serial reader thread only once"""
        if self.thread and self.thread.is_alive():
            print("Encoder thread already running")
            return

        self.running = True
        self.thread = threading.Thread(target=self._run_serial_reader, daemon=True)
        self.thread.start()
        print("Encoder thread started")

    def send_command(self, cmd):
        try:
            if self.ser and self.ser.is_open:
                self.ser.reset_output_buffer()
                self.ser.write(cmd.encode("utf-8"))
                self.ser.flush()

                with self.lock:
                    self.data["motor_on"] = (cmd == '1')

                print(f"SENT TO ARDUINO: {cmd}")
                return True
            else:
                print("Serial port not open")
                return False
        except Exception as e:
            print(f"Error sending command: {e}")
            return False

    def stop_motor(self):
        return self.send_command('0')

    def start_motor(self):
        return self.send_command('1')

    def get_safe_filename(self, filename):
        return os.path.basename(filename)

    def update_fabric_state(self, fabric_data):
        with self.lock:
            self.fabric_state["pattern"] = fabric_data.get("pattern")
            self.fabric_state["pattern_type"] = fabric_data.get("pattern_type")
            self.fabric_state["dominant_color"] = fabric_data.get("dominant_color")
            self.fabric_state["secondary_color"] = fabric_data.get("secondary_color")
            self.fabric_state["quality_score"] = fabric_data.get("quality_score")
            self.fabric_state["enhancement_mode"] = fabric_data.get("enhancement_mode")
            self.fabric_state["frames_processed"] = fabric_data.get("frames_processed", 0)
            self.fabric_state["fps"] = fabric_data.get("fps", 0)
            self.fabric_state["last_update"] = time.time()
            self.fabric_state["last_image_saved"] = fabric_data.get("saved_filename")

            self.data["fabric_pattern"] = fabric_data.get("pattern")
            self.data["fabric_quality"] = fabric_data.get("quality_score")

    def get_fabric_state(self):
        with self.lock:
            state_copy = self.fabric_state.copy()
            if state_copy["last_update"]:
                state_copy["last_update_str"] = time.strftime(
                    "%H:%M:%S",
                    time.localtime(state_copy["last_update"])
                )
            return state_copy

    def _get_available_ports(self):
        ports = []
        try:
            for port in serial.tools.list_ports.comports():
                ports.append({
                    "device": port.device,
                    "description": port.description,
                    "hwid": port.hwid
                })
        except Exception as e:
            print(f"Error listing ports: {e}")
        return ports

    def _run_serial_reader(self):
        last_status_update = 0
        reconnect_delay = 2

        while self.running:
            try:
                current_time = time.time()

                if current_time - last_status_update > 5:
                    with self.lock:
                        self.data["available_ports"] = self._get_available_ports()
                    last_status_update = current_time

                if not self.serial_connected or self.ser is None:
                    try:
                        if self.ser:
                            try:
                                self.ser.close()
                            except:
                                pass
                            self.ser = None

                        print(f"Attempting to connect to {SERIAL_PORT}...")

                        self.ser = serial.Serial(
                            port=SERIAL_PORT,
                            baudrate=BAUD_RATE,
                            timeout=0.1,
                            write_timeout=0.1
                        )

                        self.serial_connected = True
                        with self.lock:
                            self.data["status"] = f"Connected to {SERIAL_PORT}"
                            self.data["serial_connected"] = True

                        print(f"Encoder connected to {SERIAL_PORT}")

                    except serial.SerialException as e:
                        self.serial_connected = False
                        with self.lock:
                            self.data["status"] = f"Serial error: {str(e)}"
                            self.data["serial_connected"] = False
                        time.sleep(reconnect_delay)
                        continue

                if self.ser and self.serial_connected:
                    try:
                        if self.ser.in_waiting > 0:
                            line = self.ser.readline().decode("utf-8", errors="ignore").strip()
                            print("SERIAL:", line)

                            if "Pulse Count:" in line:
                                try:
                                    count = int(line.split(":")[1].strip())
                                    self._process_pulse_count(count)
                                except Exception as e:
                                    print(f"Error parsing Pulse Count line: {e}")

                            else:
                                nums = re.findall(r"-?\d+", line)
                                if nums:
                                    try:
                                        count = int(nums[-1])
                                        self._process_pulse_count(count)
                                    except Exception as e:
                                        print(f"Error parsing numeric line: {e}")

                    except serial.SerialException as e:
                        print(f"Serial read error: {e}")
                        self.serial_connected = False
                        with self.lock:
                            self.data["status"] = f"Read error: {e}"
                            self.data["serial_connected"] = False

                    self._check_stop_status()

                time.sleep(0.01)

            except Exception as e:
                print(f"Serial reader error: {e}")
                self.serial_connected = False
                with self.lock:
                    self.data["status"] = f"Error: {str(e)[:50]}"
                    self.data["serial_connected"] = False
                time.sleep(1)

    def _process_pulse_count(self, count):
        current_time = time.time()

        with self.lock:
            self.data["pulses"] = count
            cm_value = (count / PPR) * CIRCUMFERENCE
            self.data["cm"] = round(cm_value, 2)
            self.data["inches"] = round(cm_value / 2.54, 2)
            self.data["total_cm"] = self.data["cm"]
            self.data["total_inches"] = self.data["inches"]
            self.data["last_update"] = datetime.now().strftime("%H:%M:%S")
            self.data["status"] = "Receiving data"
            self.data["serial_connected"] = True

            if count != self.last_pulse_count:
                self.data["rotation"] = "Running"
                self.last_pulse_time = current_time
                self._update_pulse_rate(count, current_time)
                self.pulse_history.append(self.data["pulse_rate"])
                self.length_history.append(self.data["cm"])
                self.time_history.append(current_time)
                self.last_pulse_count = count
            else:
                self.data["rotation"] = "Stopped"

        self._emit_update_async()

    def _update_pulse_rate(self, current_count, current_time):
        time_diff = current_time - self.last_rate_calc_time

        if time_diff >= PULSE_SAMPLE_INTERVAL:
            pulse_diff = current_count - self.last_pulse_count
            if time_diff > 0 and pulse_diff > 0:
                rate = pulse_diff / time_diff
                self.pulse_rate_samples.append(rate)

                if self.pulse_rate_samples:
                    avg_rate = sum(self.pulse_rate_samples) / len(self.pulse_rate_samples)
                    self.data["pulse_rate"] = round(avg_rate, 1)
                    self.data["current_pulse"] = round(avg_rate)

                    if avg_rate > self.peak_pulse_rate:
                        self.peak_pulse_rate = avg_rate
                        self.data["peak_pulse"] = round(self.peak_pulse_rate)

                    self.data["average_pulse"] = round(
                        sum(self.pulse_rate_samples) / len(self.pulse_rate_samples), 1
                    )

            self.last_rate_calc_time = current_time

    def _check_stop_status(self):
        with self.lock:
            if self.data["rotation"] == "Running":
                if time.time() - self.last_pulse_time > STOP_TIMEOUT:
                    self.data["rotation"] = "Stopped"
                    self.data["pulse_rate"] = 0
                    self.data["current_pulse"] = 0
        self._emit_update_async()

    def _emit_update_async(self):
        if self.socketio:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.run_coroutine_threadsafe(self._emit_update(), loop)
            except RuntimeError:
                pass
            except Exception as e:
                print(f"Socket emit error: {e}")

    async def _emit_update(self):
        if self.socketio:
            try:
                await self.socketio.emit("encoder_update", self.get_status())
            except Exception as e:
                print(f"Socket.IO emit error: {e}")

    def get_status(self) -> Dict[str, Any]:
        with self.lock:
            return self.data.copy()

    def get_length(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "length_cm": self.data["cm"],
                "length_inches": self.data["inches"],
                "pulses": self.data["pulses"],
                "unit_cm": "cm",
                "unit_inches": "inches",
                "timestamp": self.data["last_update"],
                "rotation": self.data["rotation"]
            }

    def get_pulse_data(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "current_pulse": self.data["current_pulse"],
                "average_pulse": self.data["average_pulse"],
                "peak_pulse": self.data["peak_pulse"],
                "pulse_rate": self.data["pulse_rate"],
                "rotation": self.data["rotation"],
                "timestamp": self.data["last_update"],
                "pulses": self.data["pulses"]
            }

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self.lock:
            history = []
            limit = min(limit, len(self.pulse_history))

            pulse_list = list(self.pulse_history)[-limit:]
            length_list = list(self.length_history)[-limit:]
            time_list = list(self.time_history)[-limit:]

            for i in range(len(pulse_list)):
                history.append({
                    "timestamp": time_list[i] if i < len(time_list) else time.time(),
                    "pulse_rate": pulse_list[i],
                    "length_cm": length_list[i] if i < len(length_list) else 0,
                    "index": i
                })

            return history

    def reset_counter(self):
        with self.lock:
            self.data["pulses"] = 0
            self.data["cm"] = 0.0
            self.data["inches"] = 0.0
            self.data["total_cm"] = 0.0
            self.data["total_inches"] = 0.0
            self.data["current_pulse"] = 0
            self.data["average_pulse"] = 0
            self.data["peak_pulse"] = 0
            self.peak_pulse_rate = 0
            self.pulse_rate_samples.clear()
            self.pulse_history.clear()
            self.length_history.clear()
            self.time_history.clear()
            self.last_pulse_count = 0
            self.last_pulse_time = time.time()
            self.data["rotation"] = "Stopped"
            self.data["last_update"] = datetime.now().strftime("%H:%M:%S")

        self._emit_update_async()

    def shutdown(self):
        self.running = False
        self.serial_connected = False

        if self.ser and self.ser.is_open:
            try:
                self.ser.close()
            except:
                pass

        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2)

        print("Encoder system shutdown")


encoder_system = FabricEncoder()


def init_encoder():
    print("Encoder system initialized")
    ports = encoder_system._get_available_ports()
    print("Available serial ports:")
    for port in ports:
        print(f" - {port['device']}: {port['description']}")
    return encoder_system