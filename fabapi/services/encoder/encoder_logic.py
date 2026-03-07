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
SERIAL_PORT = 'COM3'  # Change this to your actual COM port
BAUD_RATE = 115200
PPR = 1200  # Pulses per revolution
WHEEL_DIAMETER = 3.8  # in cm
CIRCUMFERENCE = math.pi * WHEEL_DIAMETER  # in cm
STOP_TIMEOUT = 2.0  # seconds without pulse = stopped
HISTORY_SIZE = 200  # Number of pulse points to keep for chart
PULSE_SAMPLE_INTERVAL = 0.1  # seconds between pulse rate samples

# ==========================================================
# SAVE DIRECTORY FOR FABRIC IMAGES
# ==========================================================
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
            "motor_on": True  # Track motor state
        }
        # ==========================================================
        # FABRIC STATE (from receiver.py)
        # ==========================================================
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
        self.running = True
        self.serial_connected = False
        self.ser = None
        
        # Pulse history for chart
        self.pulse_history = deque(maxlen=HISTORY_SIZE)
        self.length_history = deque(maxlen=HISTORY_SIZE)
        self.time_history = deque(maxlen=HISTORY_SIZE)
        
        # Pulse rate calculation
        self.pulse_rate_samples = deque(maxlen=10)
        self.last_rate_calc_time = time.time()
        
        # Peak tracking
        self.peak_pulse_rate = 0
        
        # Thread lock
        self.lock = threading.Lock()
        
        # Start the background thread
        self.thread = threading.Thread(target=self._run_serial_reader, daemon=True)
        self.thread.start()

    def set_socket(self, socket):
        """Set Socket.IO instance for real-time updates"""
        self.socketio = socket
        print("🔌 Socket.IO instance set for encoder")

    def send_command(self, cmd):
        """Sends '0' for stop or '1' for start to Arduino"""
        try:
            if self.ser and self.ser.is_open:
                # Clear any old data in the output buffer
                self.ser.reset_output_buffer() 
                # Write the command
                self.ser.write(cmd.encode('utf-8'))
                # Force it out now
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
        """Stop the motor"""
        return self.send_command('0')

    def start_motor(self):
        """Start the motor"""
        return self.send_command('1')
    # ==========================================================
    # FABRIC STATE METHODS (from receiver.py)
    # ==========================================================
    
    def get_safe_filename(self, filename):
        """Keep original filename but remove unsafe path parts."""
        return os.path.basename(filename)
    
    def update_fabric_state(self, fabric_data):
        """Update fabric detection state"""
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
            
            # Also add to main data for easy access
            self.data["fabric_pattern"] = fabric_data.get("pattern")
            self.data["fabric_quality"] = fabric_data.get("quality_score")
    
    def get_fabric_state(self):
        """Get current fabric detection state"""
        with self.lock:
            # Add timestamp
            state_copy = self.fabric_state.copy()
            if state_copy["last_update"]:
                state_copy["last_update_str"] = time.strftime("%H:%M:%S", 
                                                             time.localtime(state_copy["last_update"]))
            return state_copy
    
    def save_enhanced_frame(self, file, frame_name, timestamp=""):
        """Save enhanced frame to disk"""
        try:
            safe_name = self.get_safe_filename(frame_name)
            save_path = SAVE_DIR / safe_name
            file.save(str(save_path))
            return True, safe_name, str(save_path)
        except Exception as e:
            print(f"Error saving frame: {e}")
            return False, None, None

    def _get_available_ports(self):
        """Get list of available serial ports"""
        ports = []
        try:
            available_ports = serial.tools.list_ports.comports()
            for port in available_ports:
                ports.append({
                    "device": port.device,
                    "description": port.description,
                    "hwid": port.hwid
                })
        except Exception as e:
            print(f" Error listing ports: {e}")
        return ports

    def _run_serial_reader(self):
        """Background thread to read serial data"""
        last_status_update = 0
        reconnect_delay = 2  # seconds between reconnection attempts
        
        print("🔍 Encoder thread started")
        
        while self.running:
            try:
                current_time = time.time()
                
                # Update available ports list periodically
                if current_time - last_status_update > 5:
                    with self.lock:
                        self.data["available_ports"] = self._get_available_ports()
                    last_status_update = current_time

                # Try to connect if not connected
                if not self.serial_connected or self.ser is None:
                    try:
                        # Close any existing connection
                        if self.ser:
                            try:
                                self.ser.close()
                            except:
                                pass
                            self.ser = None
                        
                        print(f" Attempting to connect to {SERIAL_PORT}...")
                        
                        # Open serial port with standard parameters
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
                        print(f" Encoder connected to {SERIAL_PORT}")
                        
                    except serial.SerialException as e:
                        self.serial_connected = False
                        error_msg = str(e)
                        
                        # Update status based on error
                        if "Access is denied" in error_msg or "PermissionError" in error_msg:
                            status_msg = f" Port {SERIAL_PORT} is in use by another program"
                            if "exclusive access" in error_msg.lower():
                                status_msg = f" Port {SERIAL_PORT} is busy (exclusive access)"
                        elif "does not exist" in error_msg.lower():
                            status_msg = f" Port {SERIAL_PORT} does not exist"
                        else:
                            status_msg = f" Error: {error_msg[:50]}..."
                        
                        with self.lock:
                            self.data["status"] = status_msg
                            self.data["serial_connected"] = False
                        
                        # Wait before retrying
                        time.sleep(reconnect_delay)
                        continue

                # Read serial data if connected
                if self.ser and self.serial_connected:
                    try:
                        if self.ser.in_waiting > 0:
                            line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                            
                            # Look for pulse count in the data
                            # Adjust this based on your actual data format
                            if "Pulse Count:" in line or "pulse" in line.lower():
                                try:
                                    # Extract number from line
                                    import re
                                    numbers = re.findall(r'\d+', line)
                                    if numbers:
                                        count = int(numbers[0])
                                        self._process_pulse_count(count)
                                except Exception as e:
                                    print(f" Error parsing pulse: {e}")
                            
                            # Also check for any numeric data
                            else:
                                try:
                                    # Try to parse as direct number
                                    count = int(line)
                                    self._process_pulse_count(count)
                                except:
                                    pass  # Not a number, ignore
                    
                    except serial.SerialException as e:
                        print(f" Serial read error: {e}")
                        self.serial_connected = False
                        with self.lock:
                            self.data["status"] = f"Read error: {e}"
                            self.data["serial_connected"] = False
                    
                    # Check stop status
                    self._check_stop_status()

                # Small sleep to prevent CPU overload
                time.sleep(0.01)

            except Exception as e:
                print(f" Serial reader error: {e}")
                self.serial_connected = False
                with self.lock:
                    self.data["status"] = f"Error: {str(e)[:50]}"
                    self.data["serial_connected"] = False
                time.sleep(1)

    def _process_pulse_count(self, count):
        """Process a new pulse count from hardware"""
        current_time = time.time()
        
        with self.lock:
            # Update basic data
            self.data["pulses"] = count
            cm_value = (count / PPR) * CIRCUMFERENCE
            self.data["cm"] = round(cm_value, 2)
            self.data["inches"] = round(cm_value / 2.54, 2)
            self.data["total_cm"] = self.data["cm"]
            self.data["total_inches"] = self.data["inches"]
            self.data["last_update"] = datetime.now().strftime("%H:%M:%S")
            self.data["status"] = "Receiving data"
            self.data["serial_connected"] = True
            
            # Detect movement
            if count != self.last_pulse_count:
                self.data["rotation"] = "Running"
                self.last_pulse_time = current_time
                
                # Calculate pulse rate
                self._update_pulse_rate(count, current_time)
                
                # Add to history
                self.pulse_history.append(self.data["pulse_rate"])
                self.length_history.append(self.data["cm"])
                self.time_history.append(current_time)
                
                self.last_pulse_count = count
            else:
                # No movement, but still connected
                self.data["rotation"] = "Stopped"

        # Emit via Socket.IO
        self._emit_update_async()

    def _update_pulse_rate(self, current_count, current_time):
        """Calculate current pulse rate"""
        time_diff = current_time - self.last_rate_calc_time
        
        if time_diff >= PULSE_SAMPLE_INTERVAL:
            pulse_diff = current_count - self.last_pulse_count
            if time_diff > 0 and pulse_diff > 0:
                rate = pulse_diff / time_diff
                self.pulse_rate_samples.append(rate)
                
                # Calculate average rate
                if self.pulse_rate_samples:
                    avg_rate = sum(self.pulse_rate_samples) / len(self.pulse_rate_samples)
                    self.data["pulse_rate"] = round(avg_rate, 1)
                    self.data["current_pulse"] = round(avg_rate)
                    
                    # Update peak
                    if avg_rate > self.peak_pulse_rate:
                        self.peak_pulse_rate = avg_rate
                        self.data["peak_pulse"] = round(self.peak_pulse_rate)
                    
                    # Update average
                    if len(self.pulse_rate_samples) > 0:
                        self.data["average_pulse"] = round(
                            sum(self.pulse_rate_samples) / len(self.pulse_rate_samples), 1
                        )
            
            self.last_rate_calc_time = current_time

    def _check_stop_status(self):
        """Check if encoder has stopped moving"""
        with self.lock:
            if self.data["rotation"] == "Running":
                if time.time() - self.last_pulse_time > STOP_TIMEOUT:
                    self.data["rotation"] = "Stopped"
                    self.data["pulse_rate"] = 0
                    self.data["current_pulse"] = 0
                    self._emit_update_async()

    def _emit_update_async(self):
        """Emit encoder update asynchronously"""
        if self.socketio:
            try:
                # Try to get the event loop
                loop = None
                if hasattr(self.socketio, '_async_server') and hasattr(self.socketio._async_server, '_loop'):
                    loop = self.socketio._async_server._loop
                
                if loop and loop.is_running():
                    asyncio.run_coroutine_threadsafe(
                        self._emit_update(),
                        loop
                    )
            except Exception as e:
                print(f" Socket emit error: {e}")

    async def _emit_update(self):
        """Emit encoder update via Socket.IO"""
        if self.socketio:
            try:
                await self.socketio.emit("encoder_update", self.get_status())
            except Exception as e:
                print(f" Socket.IO emit error: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get complete encoder status"""
        with self.lock:
            return self.data.copy()

    def get_length(self) -> Dict[str, Any]:
        """Get current length in cm and inches"""
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
        """Get current pulse data for chart"""
        with self.lock:
            return {
                "current_pulse": self.data["current_pulse"],
                "average_pulse": self.data["average_pulse"],
                "peak_pulse": self.data["peak_pulse"],
                "pulse_rate": self.data["pulse_rate"],
                "rotation": self.data["rotation"],
                "timestamp": self.data["last_update"]
            }

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get historical data for chart"""
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
        """Reset the encoder counter to zero"""
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

    def calibrate(self, wheel_diameter: Optional[float] = None, ppr: Optional[int] = None) -> Dict[str, Any]:
        """Calibrate encoder settings"""
        global WHEEL_DIAMETER, PPR, CIRCUMFERENCE
        
        with self.lock:
            if wheel_diameter is not None and wheel_diameter > 0:
                WHEEL_DIAMETER = wheel_diameter
                self.data["wheel_diameter"] = wheel_diameter
            
            if ppr is not None and ppr > 0:
                PPR = ppr
                self.data["ppr"] = ppr
            
            CIRCUMFERENCE = math.pi * WHEEL_DIAMETER
            self.data["circumference"] = CIRCUMFERENCE
            
            if self.data["pulses"] > 0:
                cm_value = (self.data["pulses"] / PPR) * CIRCUMFERENCE
                self.data["cm"] = round(cm_value, 2)
                self.data["inches"] = round(cm_value / 2.54, 2)
                self.data["total_cm"] = self.data["cm"]
                self.data["total_inches"] = self.data["inches"]
            
            return {
                "success": True,
                "wheel_diameter": WHEEL_DIAMETER,
                "ppr": PPR,
                "circumference": CIRCUMFERENCE,
                "message": "Calibration updated successfully"
            }

    def shutdown(self):
        """Shutdown the encoder thread"""
        self.running = False
        if self.ser and self.ser.is_open:
            try:
                self.ser.close()
            except:
                pass
        if hasattr(self, 'thread') and self.thread.is_alive():
            self.thread.join(timeout=2)
        print(" Encoder system shutdown")

# Global encoder instance
encoder_system = FabricEncoder()

def init_encoder():
    """Initialize the encoder system"""
    print(" Encoder system initialized")
    print("Available serial ports:")
    ports = encoder_system._get_available_ports()
    for port in ports:
        print(f"   - {port['device']}: {port['description']}")
    return encoder_system