"use client";

import {
  GoogleLogin as GoogleLoginButton,
  GoogleOAuthProvider,
} from "@react-oauth/google";

import { login } from "./actions";

// If it says auth error before logging in, go to
// https://console.cloud.google.com/auth/clients?project=slugmarketplace
// and fix the URL settings.
// Docs: https://www.npmjs.com/package/@react-oauth/google
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export type SetName = React.Dispatch<React.SetStateAction<string | null>>;

export function GoogleButtonLogin({
  setName,
  onLogin,
}: {
  setName: SetName;
  onLogin?: () => void;
}) {
  return (
    <GoogleLoginButton
      auto_select
      theme="filled_black"
      width="220"
      onSuccess={async (credentialResponse) => {
        const credential = credentialResponse.credential;

        if (!credential) {
          console.log("Login Failed");
          return;
        }

        const result = await login({ credential });

        if (result.authenticated) {
          window.sessionStorage.setItem("name", result.authenticated.name);
          setName(result.authenticated.name);
          onLogin?.();
        } else {
          console.log(result.error ?? "Login Failed");
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}

export default function GoogleLogin({
  setName,
  onLogin,
}: {
  setName: SetName;
  onLogin?: () => void;
}) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleButtonLogin setName={setName} onLogin={onLogin} />
    </GoogleOAuthProvider>
  );
}
