import type { ApiEndpointGroup } from '../../types';
import { authEndpoints } from './auth';
import { usersEndpoints } from './v1/users';

export const memberApiEndpoints = {
  name: 'generated',
  basePath: '/api',
  subEndpointGroups: {
    auth: authEndpoints,
    v1: {
      name: 'v1',
      basePath: '/v1',
      subEndpointGroups: {
        users: usersEndpoints,
      },
    },
  },
} as const satisfies ApiEndpointGroup;
