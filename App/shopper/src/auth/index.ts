import type { CredentialResponse } from "@react-oauth/google";

export interface Authenticated {
  name: string
}

export interface GoogleLoginCredentials {
  Credentials: GoogleOAuthToken;
}