import { apiFetch } from './client';
import type { CareerState } from 'shared/types';

export const stateApi = {
  get: () =>
    apiFetch<CareerState>('/api/state'),

  put: (state: CareerState) =>
    apiFetch<CareerState>('/api/state', {
      method: 'PUT',
      body: state,
    }),
};
