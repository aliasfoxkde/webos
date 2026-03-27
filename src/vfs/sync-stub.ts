/**
 * Stub for R2 cloud sync. No-op implementation.
 * Will be replaced with real sync in Phase 14.
 */
export const syncStub = {
  upload: async (_path: string, _content: ArrayBuffer): Promise<void> => {},
  download: async (_path: string): Promise<ArrayBuffer | null> => null,
  delete: async (_path: string): Promise<void> => {},
  list: async (_prefix: string): Promise<string[]> => [],
  isConnected: () => false,
  connect: async () => {},
  disconnect: async () => {},
};
