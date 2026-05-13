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
          const credential = credentialResponse.credential;

          // console.debug('[login] Google login success callback', {
          //   hasCredential: Boolean(credential),
          //   hasClientId: Boolean(googleClientId),
          // });

          if (!credential) {
            // console.error('[login] Google login callback did not include a credential');
            return;
          }

          const result = await login({ credential });

          // console.debug('[login] Shopper login action completed', {
          //   authenticated: Boolean(result.authenticated),
          //   error: result.error,
          // });

          if (result.authenticated) {
            window.sessionStorage.setItem("name", result.authenticated.name);
            setName(result.authenticated.name);
            onLogin?.();
          }
        }}
        onError={() => {
          // console.error('[login] Google login button reported an error');
        }}
      />
    </GoogleOAuthProvider>
  );
}
