export interface Credentials {
  credential: string;
}

export interface Authenticated {
  id: number;
  email: string;
  name: string;
  token: string;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
}
