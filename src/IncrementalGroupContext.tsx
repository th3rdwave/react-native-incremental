import { createContext } from 'react';

export interface IncrementalGroupContextType {
  enabled: boolean;
  groupId: string;
  incrementalCount: number;
}

export const IncrementalGroupContext =
  createContext<IncrementalGroupContextType | null>(null);
