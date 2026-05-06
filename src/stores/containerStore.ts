/**
 * NEMT Runtime - Container Store Compatibility Facade
 *
 * The layered container model now lives under src/stores/container.
 * This file preserves the previous import path during migration.
 */

export type {
  LegacyContainerViewModel as Container,
  LegacyContainerViewModel as ContainerStateView,
} from '@/types/container';

export {
  useContainerViewStore as useContainerStore,
  useLegacyContainers as useContainers,
  useSelectedContainerId,
  useIsRefreshing,
  useContainerFilter,
  useFilteredContainers,
  useContainerStats,
} from './container';
