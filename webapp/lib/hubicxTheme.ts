export type HubicxTheme = "signal" | "onyx";

export const HUBICX_THEME_KEY = "hubicx-theme";

export function getStoredHubicxTheme(): HubicxTheme {
  if (typeof window === "undefined") return "signal";
  const saved = window.localStorage.getItem(HUBICX_THEME_KEY);
  return saved === "onyx" || saved === "signal" ? saved : "signal";
}

export function applyHubicxTheme(theme: HubicxTheme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HUBICX_THEME_KEY, theme);
    const webApp = window.Telegram?.WebApp;
    try {
      if (theme === "onyx") {
        webApp?.setHeaderColor?.("#0B1220");
        webApp?.setBackgroundColor?.("#0B1220");
        webApp?.setBottomBarColor?.("#0B1220");
      } else {
        webApp?.setHeaderColor?.("#FFFFFF");
        webApp?.setBackgroundColor?.("#F7FAFE");
        webApp?.setBottomBarColor?.("#FFFFFF");
      }
    } catch {
      // Telegram color APIs are optional and should never block rendering.
    }
  }
}

export function toggleHubicxTheme(theme: HubicxTheme): HubicxTheme {
  return theme === "onyx" ? "signal" : "onyx";
}
