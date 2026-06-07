import { apiFetch } from './client';

export interface SyncData {
  commits: number;
  solved:  number;
}

export const syncApi = {
  fetch: (since?: string): Promise<SyncData> => {
    const path = since ? `/api/sync?since=${encodeURIComponent(since)}` : '/api/sync';
    return apiFetch<SyncData>(path);
  },
};
