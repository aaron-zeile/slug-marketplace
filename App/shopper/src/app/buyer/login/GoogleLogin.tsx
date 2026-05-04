"use client";

import {
  GoogleLogin as GoogleLoginButton,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import { useState } from "react";

import { login } from "./actions";

// If it says auth error before logging in, go to
// https://console.cloud.google.com/auth/clients?project=slugmarketplace
// and fix the URL settings.
// Docs: https://www.npmjs.com/package/@react-oauth/google
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
type SetName = React.Dispatch<React.SetStateAction<string | null>>;

function LoginShell({
  //state made by codex
  children,
}: {
  children: (setName: SetName) => React.ReactNode;
}) {
  const [name, setName] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.sessionStorage.getItem("name");
  });

  return (
    <main>
      <h1>SlugMarketPlace</h1>
      {name && <h2>{name}</h2>}
      {children(setName)}
    </main>
  );
}

export function GoogleButtonLogin({ setName }: { setName: SetName }) {
  return (
    <GoogleLoginButton
      auto_select
      theme="filled_black"
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

export default function GoogleLogin() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoginShell>
        {(setName: SetName) => (
          <GoogleButtonLogin setName={setName} />
        )}
      </LoginShell>
    </GoogleOAuthProvider>
  );
}
