import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Invalid JWT token');
    return null;
  }
};
