declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        isFullscreen?: boolean;
        requestFullscreen?: () => void;
        exitFullscreen?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        setBottomBarColor?: (color: string) => void;
        onEvent?: (eventType: string, eventHandler: (event?: { error?: string }) => void) => void;
        MainButton?: { hide: () => void };
      };
    };
  }
}

export type TelegramAuthState = {
  hasTelegram: boolean;
  hasTelegramWebApp: boolean;
  initData: string;
  userId: number | null;
};

export type TelegramDebugState = {
  hasWindowTelegram: boolean;
  hasTelegramWebApp: boolean;
  initDataLength: number;
  initDataUnsafeUserId: string;
  backendUrl: string;
  currentUrl: string;
};

type TelegramWebApp = NonNullable<NonNullable<Window["Telegram"]>["WebApp"]>;

let telegramUiInitialized = false;

function currentTelegramColors() {
  const theme = typeof document === "undefined" ? "signal" : document.documentElement.dataset.theme;
  return theme === "onyx"
    ? { header: "#0B1220", background: "#0B1220", bottom: "#0B1220" }
    : { header: "#FFFFFF", background: "#F7FAFE", bottom: "#FFFFFF" };
}

function initializeTelegramUi(webApp: TelegramWebApp) {
  try {
    webApp.ready?.();
    webApp.expand?.();
  } catch {
    // Outside real Telegram WebApp these calls can fail; auth handling below will show a clear error.
  }

  if (telegramUiInitialized) return;
  telegramUiInitialized = true;

  try {
    const colors = currentTelegramColors();
    webApp.setHeaderColor?.(colors.header);
    webApp.setBackgroundColor?.(colors.background);
    webApp.setBottomBarColor?.(colors.bottom);
  } catch {
    // Older Telegram clients can ignore theme API calls.
  }

  try {
    webApp.onEvent?.("fullscreenChanged", () => {
      if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.info("Telegram fullscreen changed", webApp.isFullscreen);
      }
    });
    webApp.onEvent?.("fullscreenFailed", (event) => {
      if (event?.error !== "UNSUPPORTED") {
        console.warn("Telegram fullscreen failed", event?.error);
      }
    });
  } catch {
    // Fullscreen events are optional in older clients.
  }

  try {
    if (typeof webApp.requestFullscreen === "function" && !webApp.isFullscreen) {
      webApp.requestFullscreen();
    }
  } catch (error) {
    console.warn("fullscreen request failed", error);
  }
}

export async function initTelegramWebApp(timeoutMs = 3000): Promise<TelegramWebApp | null> {
  if (typeof window === "undefined") return null;
  const webApp = await waitForTelegramWebApp(timeoutMs);
  if (!webApp) return null;
  initializeTelegramUi(webApp);
  return webApp;
}

export async function waitForTelegramWebApp(timeoutMs = 3000): Promise<TelegramWebApp | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      initializeTelegramUi(webApp);
      return webApp;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

export async function getTelegramInitData(): Promise<TelegramAuthState> {
  if (typeof window === "undefined") return { hasTelegram: false, hasTelegramWebApp: false, initData: "", userId: null };
  const webApp = await waitForTelegramWebApp();
  const state = {
    hasTelegram: Boolean(window.Telegram),
    hasTelegramWebApp: Boolean(webApp),
    initData: webApp?.initData || "",
    userId: webApp?.initDataUnsafe?.user?.id || null,
  };
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.info("telegram-webapp-auth", {
      hasTelegram: state.hasTelegram,
      hasTelegramWebApp: state.hasTelegramWebApp,
      hasInitData: Boolean(state.initData),
      initDataLength: state.initData.length,
      hasInitDataUnsafeUser: Boolean(state.userId),
      initDataUnsafeUserId: state.userId,
      backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    });
  }
  return state;
}

export function getTelegramDebugState(): TelegramDebugState {
  const webApp = typeof window === "undefined" ? undefined : window.Telegram?.WebApp;
  return {
    hasWindowTelegram: typeof window !== "undefined" && Boolean(window.Telegram),
    hasTelegramWebApp: Boolean(webApp),
    initDataLength: (webApp?.initData || "").length,
    initDataUnsafeUserId: webApp?.initDataUnsafe?.user?.id ? "exists" : "missing",
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    currentUrl: typeof window === "undefined" ? "" : window.location.href,
  };
}

export function initTelegram(): Promise<TelegramAuthState> {
  return getTelegramInitData();
}

export function getInitData(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData || "";
}

export function getTelegramLanguageCode(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || "";
}
