/**
 * Thin wrapper around Google Identity Services (GIS) for ID-token-based
 * sign-in. The GIS script is loaded from index.html so we just wait for
 * `window.google.accounts.id` to be ready, then call `requestGoogleIdToken`.
 *
 * Configure the OAuth Client ID via `VITE_GOOGLE_CLIENT_ID`.
 */

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
    ux_mode?: 'popup' | 'redirect';
    context?: 'signin' | 'signup' | 'use';
  }) => void;
  prompt: (notification?: (n: PromptMomentNotification) => void) => void;
  disableAutoSelect: () => void;
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason?: () => string;
  getSkippedReason?: () => string;
  getDismissedReason?: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const SCRIPT_READY_TIMEOUT_MS = 8_000;
const SCRIPT_POLL_INTERVAL_MS = 100;

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';
}

export function isGoogleSignInConfigured(): boolean {
  return getGoogleClientId().trim().length > 0;
}

/**
 * Wait for Google Identity Services to finish loading. The script is
 * tagged `async defer` in index.html, so we poll until `window.google` is
 * ready or we hit the timeout.
 */
async function waitForGsi(): Promise<GoogleAccountsId> {
  const deadline = Date.now() + SCRIPT_READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const gid = window.google?.accounts?.id;
    if (gid) return gid;
    await new Promise((resolve) => window.setTimeout(resolve, SCRIPT_POLL_INTERVAL_MS));
  }

  throw new Error('Google Sign-In is unavailable. Please try again.');
}

/**
 * Open the Google One Tap / pop-up prompt and resolve with the returned
 * ID token. Rejects if the user dismisses the prompt or the script fails
 * to load.
 */
export async function requestGoogleIdToken(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Sign-In is not configured.');
  }

  const gid = await waitForGsi();

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    gid.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        settled = true;
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('Google did not return a credential.'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      context: 'signin',
    });

    gid.prompt((notification) => {
      if (settled) return;
      if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
        settled = true;
        reject(new Error('Google Sign-In was cancelled.'));
      }
    });
  });
}
