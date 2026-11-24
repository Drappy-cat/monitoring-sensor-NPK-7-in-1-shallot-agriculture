// ESP32-CAM and backend configuration
export const CAMERA_CONFIG = {
  // ESP32-CAM direct endpoints (local network only)
  ESP32_IP: '192.168.1.6',
  ESP32_STREAM_URL: 'http://192.168.1.6/stream',

  // Node.js backend relay (port 5000)
  BACKEND_BASE: typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : 'http://localhost:5000',
  get PROXY_STREAM_URL() {
    return `${this.BACKEND_BASE}/api/camera/stream`;
  },
  get WS_RELAY_URL() {
    const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `${proto}://${host}:5000/ws/client`;
  },
  get STATUS_URL() {
    return `${this.BACKEND_BASE}/api/status`;
  },
  get TIMELAPSE_URL() {
    return `${this.BACKEND_BASE}/api/camera/timelapse`;
  },
  get CMD_URL() {
    return `${this.BACKEND_BASE}/api/cmd`;
  },

  // Stream behavior
  DEFAULT_TIMEOUT_SECONDS: 45,
  EXTEND_SECONDS: 30,
  MAX_TIMEOUT_SECONDS: 180,

  // Video recording
  RECORD_DURATION_SECONDS: 15,
  RECORD_FPS: 10,
} as const;
