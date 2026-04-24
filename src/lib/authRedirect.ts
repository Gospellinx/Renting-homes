const LOCAL_DEV_ORIGIN = "http://localhost:3000";
const RETURN_URL_KEY = "auth_return_url";
const INTENDED_ACTION_KEY = "intended_action";
const DEFAULT_AUTH_PATH = "/";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const toSafePath = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (typeof window === "undefined") {
    return value.startsWith("/") ? value : null;
  }

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.startsWith("/") ? value : null;
  }
};

export const getAppOrigin = () => {
  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }

  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  return configuredSiteUrl ? trimTrailingSlash(configuredSiteUrl) : LOCAL_DEV_ORIGIN;
};

export const getAuthCallbackUrl = () => `${getAppOrigin()}/auth/callback`;

export const consumePostAuthRedirectPath = () => {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_PATH;
  }

  const storedReturnUrl = sessionStorage.getItem(RETURN_URL_KEY);
  if (storedReturnUrl) {
    sessionStorage.removeItem(RETURN_URL_KEY);
    return toSafePath(storedReturnUrl) ?? DEFAULT_AUTH_PATH;
  }

  const storedIntendedAction = sessionStorage.getItem(INTENDED_ACTION_KEY);
  if (!storedIntendedAction) {
    return DEFAULT_AUTH_PATH;
  }

  sessionStorage.removeItem(INTENDED_ACTION_KEY);

  try {
    const parsed = JSON.parse(storedIntendedAction) as { page?: string };
    return toSafePath(parsed.page) ?? DEFAULT_AUTH_PATH;
  } catch {
    return DEFAULT_AUTH_PATH;
  }
};
