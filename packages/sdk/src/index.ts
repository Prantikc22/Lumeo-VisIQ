// TypeScript: Explicitly augment global for ThumbmarkJS
export {};
declare global {
  interface Window {
    ThumbmarkJS?: any;
    Fingerprint2?: {
      get(cb: (components: any[]) => void): void;
    };
    NEXT_PUBLIC_SITE_URL?: string;
    FINGERPRINT_FALLBACK_ENABLED?: string;
    visitoriq?: any;
  }
}
// Utility: Check if this fingerprint is blocked (calls /api/blocks)
async function checkIfBlocked(siteKey: string, fingerprint_hash: string, apiBase: string = ''): Promise<boolean> {
  const resp = await fetch(`${apiBase}/api/blocks?siteKey=${siteKey}`, {
    headers: { 'x-usage-track': 'true' }
  });
  const data = await resp.json();
  return data.blocks && data.blocks.some((b: any) => b.value === fingerprint_hash);
}

// UMD VisitorIQ SDK
// Try to import sha256 from tiny-sha256, fallback to window.sha256 for browser UMD
let sha256: (input: string) => string
try {
  // @ts-ignore
  sha256 = require('tiny-sha256').sha256 || require('tiny-sha256')
} catch {
  // fallback for browser UMD
  sha256 = (window as any).sha256
}

let lastResult: any = null
const OFFLINE_QUEUE_KEY = 'visitoriq_offline_queue'

function getResolution() {
  return `${window.screen.width}x${window.screen.height}`
}

function getTimezoneOffsetMinutes() {
  return new Date().getTimezoneOffset()
}

function getReferrer() {
  try {
    return document.referrer || ''
  } catch {
    return ''
  }
}

function getWebdriver() {
  return navigator.webdriver || false
}

async function detectIncognito() {
  // StorageManager heuristic
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate()
      if (estimate.quota && estimate.quota < 120000000) return true
    } catch {}
  }
  // IndexedDB heuristic
  try {
    const db = window.indexedDB.open('test')
    db.onerror = () => true
    db.onsuccess = () => { db.result.close(); window.indexedDB.deleteDatabase('test') }
    return false
  } catch {
    return true
  }
}

function loadThumbmarkJS(thumbmarkKey?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.ThumbmarkJS) return resolve(window.ThumbmarkJS)
    const script = document.createElement('script')
    script.src = thumbmarkKey || 'https://cdn.jsdelivr.net/npm/thumbmarkjs@latest/dist/thumbmark.min.js'
    script.onload = () => resolve(window.ThumbmarkJS)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function getCanvasHash() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText(navigator.userAgent, 2, 2)
    return sha256(canvas.toDataURL())
  } catch {
    return 'canvas-fallback'
  }
}

async function getFingerprintHash(fallbackEnabled: boolean) {
  // Try ThumbmarkJS canvas/webgl hash
  if (window.ThumbmarkJS && window.ThumbmarkJS.getCanvasHash) {
    try {
      return await window.ThumbmarkJS.getCanvasHash()
    } catch {}
  }
  // Fallback: FingerprintJS OSS (if enabled)
  if (fallbackEnabled && window.Fingerprint2) {
    return new Promise<string>(resolve => {
      window.Fingerprint2!.get((components: any[]) => {
        const values = components.map((c: any) => c.value).join('')
        resolve(sha256(values))
      })
    })
  }
  // Fallback: simple canvas hash
  return getCanvasHash()
}

function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}
function setOfflineQueue(q: any[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q))
}

async function flushOfflineQueue(endpoint: string) {
  const queue = getOfflineQueue()
  if (!queue.length) return
  for (const item of queue) {
    try {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    } catch {}
  }
  setOfflineQueue([])
}

async function getGeolocation(): Promise<{lat?: number, lon?: number, accuracy?: number, permission: 'granted'|'denied'|'prompt'}> {
  if (!navigator.geolocation) return { permission: 'denied' };
  try {
    const perm = await navigator.permissions?.query?.({ name: 'geolocation' as PermissionName })
    let permission: 'granted'|'denied'|'prompt' = perm?.state || 'prompt';
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          permission: 'granted'
        }),
        err => resolve({ permission: (err.code === 1 ? 'denied' : 'prompt') }),
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
      );
    });
  } catch {
    return { permission: 'denied' };
  }
}

function detectEmulatorHeuristics(): { isEmulator: boolean, reasons: string[] } {
  const reasons: string[] = [];
  // Heuristic: Device memory too low/high, touch support mismatch, UA anomalies
  if ((navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency > 16) reasons.push('High hardware concurrency');
  if ((navigator as any).deviceMemory && ((navigator as any).deviceMemory > 16 || (navigator as any).deviceMemory < 1)) reasons.push('Unusual device memory');
  if ('ontouchstart' in window === false && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) reasons.push('No touch on mobile UA');
  if (/emulator|sdk|simulator/i.test(navigator.userAgent)) reasons.push('UA mentions emulator');
  return { isEmulator: reasons.length > 0, reasons };
}

async function init({ siteKey, endpoint, onResult, thumbmarkKey, fallbackEnabled, email, botd_result }: {
  siteKey: string,
  endpoint?: string,
  onResult?: (result: any) => void,
  thumbmarkKey?: string,
  fallbackEnabled?: boolean,
  email?: string,
  botd_result?: any
}) {
  endpoint = endpoint || (window.NEXT_PUBLIC_SITE_URL ? window.NEXT_PUBLIC_SITE_URL + '/api/collect-visitor' : '/api/collect-visitor')
  fallbackEnabled = fallbackEnabled ?? (window.FINGERPRINT_FALLBACK_ENABLED === 'true')

  // Collect signals
  const userAgent = navigator.userAgent
  const language = navigator.language
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timezoneOffset = getTimezoneOffsetMinutes()
  const resolution = getResolution()
  const referrer = getReferrer()
  const webdriver = getWebdriver()
  const incognito = await detectIncognito()

  // Advanced: Get geolocation (GPS) and emulator heuristics
  const geo = await getGeolocation();
  const emulator = detectEmulatorHeuristics();

  // Load ThumbmarkJS if not present
  if (!window.ThumbmarkJS) {
    try { await loadThumbmarkJS(thumbmarkKey) } catch {}
  }

  // Get canvas/fingerprint hash
  const canvasHash = await getFingerprintHash(!!fallbackEnabled)

  // Always get ThumbmarkJS result
  let thumbmark: any = undefined;
  try {
    if (window.ThumbmarkJS) {
      thumbmark = await new window.ThumbmarkJS.Thumbmark().get();
    }
  } catch (e) {
    thumbmark = undefined;
  }
  // Use .thumbmark as fingerprint_hash if available, fallback to old logic
  const fingerprint_hash = thumbmark && thumbmark.thumbmark
    ? thumbmark.thumbmark
    : sha256(userAgent + canvasHash + resolution + timezone);

  // Parse browser and OS from userAgent
  function parseBrowserOS(ua: string): { browser: string; os: string } {
    let browser = '', os = '';
    // Very basic UA parsing (can be replaced with UAParser.js or similar if needed)
    if (/chrome|crios|crmo/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr\//i.test(ua)) browser = 'Opera';
    else if (/msie|trident/i.test(ua)) browser = 'IE';
    else browser = (ua.split(' ')[0] || '').split('/')[0];

    if (/windows nt/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os x/i.test(ua)) os = 'Mac OS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else os = 'Unknown';
    return { browser, os };
  }
  const { browser, os } = parseBrowserOS(userAgent);

  const payload: any = {
    siteKey,
    fingerprint_hash,
    userAgent,
    language,
    timezone,
    timezoneOffset,
    resolution,
    referrer,
    incognito,
    webdriver,
    thumbmark_details: thumbmark || {},
    browser,
    os,
    geo,
    emulator
  };


  if (email) payload.email = email;
  if (botd_result) payload.botd_result = botd_result;

  // Attempt POST, queue if offline
  try {
    console.log('VisitorIQ SDK payload', payload);
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    lastResult = await resp.json()
    if (onResult) onResult(lastResult)
    flushOfflineQueue(endpoint)
  } catch (err) {
    // Queue for retry
    const queue = getOfflineQueue()
    queue.push(payload)
    setOfflineQueue(queue)
  }
}

function getLastResult() {
  return lastResult
}

window.visitoriq = { init, getLastResult }
export { init, getLastResult }

