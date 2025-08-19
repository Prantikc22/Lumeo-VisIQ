declare interface Window {
  ThumbmarkJS?: any;
  Fingerprint2?: {
    get(cb: (components: any[]) => void): void;
  };
  visitoriq?: any;
  NEXT_PUBLIC_SITE_URL?: string;
  FINGERPRINT_FALLBACK_ENABLED?: string;
}

declare module 'tiny-sha256' {
  export function sha256(input: string): string;
  export default sha256;
}
