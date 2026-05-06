/**
 * NEMT Runtime - Strategy Store Compatibility Facade
 *
 * The layered strategy model now lives under src/stores/strategy.
 */

export {
  useStrategyDefinitionStore as useStrategyStore,
  useStrategyDefinitions as useStrategies,
  useSelectedStrategyDefinitionId as useSelectedStrategyId,
  useSelectedStrategyDefinition as useSelectedStrategy,
} from './strategy';

export { useStrategyRuntimesByStatus as useStrategiesByStatus } from './strategy';

export const useRunningStrategies = () => [];
