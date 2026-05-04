"use client";

import {
  GoogleLogin as GoogleLoginButton,
  GoogleOAuthProvider,
  type PromptMomentNotification,
  useGoogleOneTapLogin,
} from "@react-oauth/google";

// If it says auth error before logging in, go to
// https://console.cloud.google.com/auth/clients?project=slugmarketplace
// and fix the URL settings.
// Docs: https://www.npmjs.com/package/@react-oauth/google
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function LoginShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <h1>SlugMarketPlace</h1>
      {children}
    </main>
  );
}

export function GoogleButtonLogin() {
  return (
    <GoogleLoginButton
      auto_select
      theme="filled_black"
      onSuccess={(credentialResponse) => {
        const token = credentialResponse.credential;

  if (!token) return;

  const payload = JSON.parse(atob(token.split(".")[1]));

  console.log("Google ID:", payload.sub);
  console.log("Email:", payload.email);
        console.log(credentialResponse);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}

function logPromptMoment(notification: PromptMomentNotification) {
  if (notification.isNotDisplayed()) {
    console.log("One Tap not displayed:", notification.getNotDisplayedReason());
  }

  if (notification.isSkippedMoment()) {
    console.log("One Tap skipped:", notification.getSkippedReason());
  }

  if (notification.isDismissedMoment()) {
    console.log("One Tap dismissed:", notification.getDismissedReason());
  }
}

function OneTapPrompt() {
  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      console.log(credentialResponse);
    },
    onError: () => {
      console.log("Login Failed");
    },
    promptMomentNotification: logPromptMoment,
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: true,
  });

  return null;
}

export function GoogleOneTapLogin() {
  return <OneTapPrompt />;
}

export default function GoogleLogin() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoginShell>
        <GoogleButtonLogin />
        {/* <GoogleOneTapLogin /> */}
      </LoginShell>
    </GoogleOAuthProvider>
  );
}
