declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        MainButton?: { hide: () => void };
      };
    };
  }
}

export function initTelegram() {
  if (typeof window === "undefined") return;
  window.Telegram?.WebApp?.ready();
  window.Telegram?.WebApp?.expand();
}

export function getInitData(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData || "";
}
