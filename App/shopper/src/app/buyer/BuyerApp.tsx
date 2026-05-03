"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Landing } from "./Landing";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function BuyerApp() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <main>
        <h1>SlugMarketPlace</h1>
        <Landing />
      </main>
    </GoogleOAuthProvider>
  );
}
