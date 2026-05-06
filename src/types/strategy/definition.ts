/**
 * NEMT Runtime - Strategy Definition Types
 * Persistent strategy definitions separate from live runtime state.
 */

import type { BaseEntity } from '@/types/shared';
import type { ContainerBoundaryKind } from '@/types/container';

import type {
  RiskLevel,
  StrategyConfig,
  StrategyType,
  TimeFrame,
  TradingMode,
} from '@/types/strategy';

export interface StrategyDefinition extends BaseEntity {
  name: string;
  description: string;
  author: string;
  version: string;
  code: string;
  language: 'python' | 'javascript' | 'typescript' | 'go' | 'rust';
  type: StrategyType;
  tags: string[];
  tradingMode: TradingMode;
  timeFrames: TimeFrame[];
  config: StrategyConfig;
  riskLevel: RiskLevel;
  maxPositionSize: number;
  maxDrawdownLimit: number;
  preferredContainerBoundaryKinds: ContainerBoundaryKind[];
  isPublic: boolean;
  isTemplate: boolean;
  allowCopy: boolean;
  publishedAt?: number;
}
