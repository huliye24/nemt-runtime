/**
 * NEMT Platform - Auth Types
 * 用户认证相关类型定义
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const DEMO_USER: User = {
  id: 'demo_user_1',
  email: 'demo@example.com',
  name: 'Demo User',
};
