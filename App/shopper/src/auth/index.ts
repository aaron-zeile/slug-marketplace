export interface Authenticated {
  id: number;
  email: string;
  name: string;
}

export interface Credentials {
  credential: string;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
}
