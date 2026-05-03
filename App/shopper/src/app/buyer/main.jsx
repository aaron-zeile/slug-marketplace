import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./Landing";

const googleClientId = import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <main>
        <h1>Slug Market Place</h1>
        <Landing />
      </main>
    </GoogleOAuthProvider>
  </StrictMode>,
);
