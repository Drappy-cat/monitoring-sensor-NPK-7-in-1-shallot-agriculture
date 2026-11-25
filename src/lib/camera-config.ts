// ESP32-CAM and backend configuration

function getBackendBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_CAMERA_BACKEND_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');
    // Local Node.js relay always listens over HTTP on port 5000
    if (isLocalHost) {
      return `http://${host}:5000`;
    }
  }
  // When accessed from HTTPS production (Vercel), point to user's local Node.js relay
  return 'http://localhost:5000';
}

export const CAMERA_CONFIG = {
  // ESP32-CAM direct endpoints (local network only)
  ESP32_IP: '192.168.1.6',
  ESP32_STREAM_URL: 'http://192.168.1.6/stream',

  // Node.js backend relay (port 5000)
  get BACKEND_BASE() {
    return getBackendBase();
  },
  get PROXY_STREAM_URL() {
    return `${this.BACKEND_BASE}/api/camera/stream`;
  },
  get WS_RELAY_URL() {
    const base = this.BACKEND_BASE.replace(/^http/, 'ws');
    return `${base}/ws/client`;
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

  // Connection retry behavior (5x loop)
  MAX_CONNECT_RETRIES: 5,
  CONNECT_ATTEMPT_TIMEOUT_MS: 6000,
  RETRY_DELAY_MS: 1200,

  // Stream auto-off behavior
  DEFAULT_TIMEOUT_SECONDS: 45,
  EXTEND_SECONDS: 30,
  MAX_TIMEOUT_SECONDS: 180,

  // Video recording
  RECORD_DURATION_SECONDS: 15,
  RECORD_FPS: 10,
} as const;
