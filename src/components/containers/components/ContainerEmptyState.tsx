/**
 * ContainerEmptyState Component
 * 
 * 容器空状态
 */

import { Container, Plus } from 'lucide-react';
import { Colors, ButtonVariants } from '../../../presets/presets';

interface ContainerEmptyStateProps {
  onCreateNew: () => void;
}

export function ContainerEmptyState({ onCreateNew }: ContainerEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl"
      style={{ backgroundColor: Colors.bgSecondary, border: `1px dashed ${Colors.border}` }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: Colors.bgTertiary }}
      >
        <Container size={28} style={{ color: Colors.textMuted }} />
      </div>
      <h3 className="text-lg font-medium mb-2" style={{ color: Colors.textSecondary }}>
        暂无容器
      </h3>
      <p className="text-sm mb-6" style={{ color: Colors.textMuted }}>
        创建你的第一个 Docker 容器
      </p>
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{ backgroundColor: ButtonVariants.primary.bg, color: ButtonVariants.primary.color }}
      >
        <Plus size={16} />
        创建容器
      </button>
    </div>
  );
}
