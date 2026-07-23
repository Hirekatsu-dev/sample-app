import type { ApiEndpointGroup } from '../../types';

export const memberApiEndpoints = {
  name: 'generated',
  basePath: '/api',
  subEndpointGroups: {
    v1: {
      name: 'v1',
      basePath: '/v1',
      subEndpointGroups: {},
    },
  },
} as const satisfies ApiEndpointGroup;
