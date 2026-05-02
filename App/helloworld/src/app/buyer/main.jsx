import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
        <h1>Buyer Service</h1>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
