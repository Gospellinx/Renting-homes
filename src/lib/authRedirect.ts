const LOCAL_DEV_ORIGIN = "http://localhost:3000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getAppOrigin = () => {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return trimTrailingSlash(configuredSiteUrl);
  }

  if (typeof window === "undefined") {
    return LOCAL_DEV_ORIGIN;
  }

  const { origin, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCAL_DEV_ORIGIN;
  }

  return trimTrailingSlash(origin);
};

export const getAuthCallbackUrl = () => `${getAppOrigin()}/auth/callback`;
