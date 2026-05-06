/**
 * NEMT Platform - User Menu
 * Header 中的用户下拉菜单
 */

import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { Colors } from '@/presets/presets';
import { useAuthStore } from '@/stores/authStore';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  const getInitial = () => user.name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
        style={{
          backgroundColor: isOpen ? Colors.bgTertiary : 'transparent',
          border: `1px solid ${isOpen ? Colors.border : 'transparent'}`,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = Colors.bgTertiary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-medium"
          style={{
            backgroundColor: Colors.accent,
            color: Colors.bg,
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-lg" />
          ) : (
            getInitial()
          )}
        </div>

        <span className="max-w-24 truncate text-sm font-medium" style={{ color: Colors.text }}>
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl py-2 shadow-lg"
          style={{
            backgroundColor: Colors.bgSecondary,
            border: `1px solid ${Colors.border}`,
          }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: Colors.border }}>
            <p className="text-sm font-medium" style={{ color: Colors.text }}>
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-xs" style={{ color: Colors.textMuted }}>
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
              style={{ color: Colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = Colors.bgTertiary;
                e.currentTarget.style.color = Colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = Colors.textSecondary;
              }}
            >
              <User size={16} />
              <span>个人资料</span>
            </button>

            <button
              className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
              style={{ color: Colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = Colors.bgTertiary;
                e.currentTarget.style.color = Colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = Colors.textSecondary;
              }}
            >
              <Settings size={16} />
              <span>设置</span>
            </button>
          </div>

          <div className="my-1 border-t" style={{ borderColor: Colors.border }} />

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
              style={{ color: Colors.error }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = Colors.bgTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
