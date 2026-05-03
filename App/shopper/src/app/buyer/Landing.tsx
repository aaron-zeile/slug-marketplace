"use client";

import { GoogleLogin } from "@react-oauth/google";
//If it says auth error before logging in go to https://console.cloud.google.com/auth/clients?project=slugmarketplace to 
//fix url settings
export function Landing() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log(credentialResponse);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
