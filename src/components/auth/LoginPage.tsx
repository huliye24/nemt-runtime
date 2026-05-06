/**
 * NEMT Platform - Login Page
 * 用户登录页面
 */

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/presets/presets';

export function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const { login, loginDemo, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError('登录失败，请重试');
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: Colors.bg }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: Colors.bgSecondary,
          border: `1px solid ${Colors.border}`,
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: Colors.accent }}
          >
            <span className="text-2xl font-bold" style={{ color: Colors.bg }}>
              N
            </span>
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: Colors.text }}
          >
            NEMT Runtime
          </h1>
          <p className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
            登录以继续
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: Colors.textSecondary }}
            >
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: Colors.bgTertiary,
                border: `1px solid ${Colors.border}`,
                color: Colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.borderFocus;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.border;
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: Colors.textSecondary }}
            >
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: Colors.bgTertiary,
                border: `1px solid ${Colors.border}`,
                color: Colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.borderFocus;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.border;
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: Colors.error }}>
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: Colors.accent,
              color: Colors.bg,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* Demo Login */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: Colors.bgTertiary,
              color: Colors.textSecondary,
              border: `1px solid ${Colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = Colors.borderHover;
              e.currentTarget.style.color = Colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = Colors.border;
              e.currentTarget.style.color = Colors.textSecondary;
            }}
          >
            Demo 登录
          </button>
        </div>

        {/* Forgot Password */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm transition-colors"
            style={{ color: Colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = Colors.textSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = Colors.textMuted;
            }}
          >
            忘记密码？
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
