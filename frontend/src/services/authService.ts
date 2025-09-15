import { LoginRequest, LoginResponse, User } from '../types';
import api from './api';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.postWithHeaders('/login', credentials);

    // 대소문자 구분없이 Authorization 헤더 찾기 (Axios v1 headers are case-insensitive and expose .get)
    const authHeaderRaw =
      typeof response.headers?.get === 'function'
        ? response.headers.get('authorization')
        : (response.headers?.authorization ?? response.headers?.Authorization);

    const authHeader = authHeaderRaw ?? undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      localStorage.setItem('token', token);

      // 사용자 정보는 임시로 username만 저장
      const user = {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
      };
      localStorage.setItem('user', JSON.stringify(user));

      return {
        token: token,
        user: user,
      };
    }

    console.log('No valid auth header found');
    throw new Error('로그인에 실패했습니다.');
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
