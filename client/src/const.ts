export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (): string | null => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    console.warn(
      "Missing OAuth configuration: VITE_OAUTH_PORTAL_URL and VITE_APP_ID are required for login URL generation."
    );
    return null;
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // In development, use the backdoor login route instead of a real OAuth provider
  if (import.meta.env.MODE === "development" || import.meta.env.VITE_OAUTH_PORTAL_URL === "https://your-auth-server.com") {
    return `${window.location.origin}/api/oauth/dev-login`;
  }

  const url = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
