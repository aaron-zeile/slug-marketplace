export interface Credentials {
  credential: string;
}

export interface Authenticated {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface CorporateApiKeyRequest {
  name: string;
}

export interface CorporateApiKeyCreated {
  id: string;
  name: string;
  key: string;
  created_at: string;
}
