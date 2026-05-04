"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

import { login } from "./actions";

export function Landing() {
  const [name, setName] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.sessionStorage.getItem("name");
  });

  return (
    <main>
      {name && <h1>{name}</h1>}
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          console.log(credentialResponse);

          if (!credentialResponse.credential) {
            console.log("Login Failed");
            return;
          }

          const result = await login({
            credential: credentialResponse.credential,
          });

          if (result.authenticated) {
            window.sessionStorage.setItem("name", result.authenticated.name);
            setName(result.authenticated.name);
            // Not needed because login isn't required.
            // router.push("/");
          } else {
            console.log(result.error ?? "Login Failed");
          }
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </main>
  );
}
