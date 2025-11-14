// src/auth/interfaces/jwt-payload.interface.ts

import { Role } from './roles.types';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: Role[];
  tokenType: string;
}
