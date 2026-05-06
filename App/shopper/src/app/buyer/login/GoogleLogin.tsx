"use client";

import {
  GoogleLogin as GoogleLoginButton,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import type { Dispatch, SetStateAction } from "react";

import { login } from "./actions";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleLoginProps {
  setName: Dispatch<SetStateAction<string | null>>;
  onLogin?: () => void;
}

export default function GoogleLogin({
  setName,
  onLogin,
}: GoogleLoginProps) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleLoginButton
        auto_select
        theme="filled_black"
        width="220"
        onSuccess={async (credentialResponse) => {
          const credential = credentialResponse.credential!;

          const result = await login({ credential });

          if (result.authenticated) {
            window.sessionStorage.setItem("name", result.authenticated.name);
            setName(result.authenticated.name);
            onLogin?.();
          } 
        }}
      />
    </GoogleOAuthProvider>
  );
}
