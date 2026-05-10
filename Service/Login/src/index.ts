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
