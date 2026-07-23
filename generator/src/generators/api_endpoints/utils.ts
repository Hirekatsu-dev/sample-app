import type { ApiEndpointGroup } from '@seed/api_endpoints/types';

export const isApiEndpointGroup = (
  value: unknown,
): value is ApiEndpointGroup => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'basePath' in value &&
    (('endpoints' in value &&
      Array.isArray((value as Record<string, unknown>).endpoints)) ||
      ('subEndpointGroups' in value &&
        typeof (value as Record<string, unknown>).subEndpointGroups ===
          'object'))
  );
};

export const collectEndpointGroups = (
  group: ApiEndpointGroup,
  parentPath = '',
  parentBasePath = '',
): Record<string, ApiEndpointGroup> => {
  const groups: Record<string, ApiEndpointGroup> = {};

  const fullBasePath = parentBasePath + group.basePath;

  if (group.endpoints && group.endpoints.length > 0) {
    const groupKey = parentPath ? `${parentPath}_${group.name}` : group.name;
    const updatedGroup: ApiEndpointGroup = {
      ...group,
      basePath: fullBasePath,
    };
    groups[groupKey] = updatedGroup;
  }

  if (group.subEndpointGroups) {
    for (const [_key, subGroup] of Object.entries(group.subEndpointGroups)) {
      if (isApiEndpointGroup(subGroup)) {
        const currentPath = parentPath
          ? `${parentPath}_${group.name}`
          : group.name;
        const nestedGroups = collectEndpointGroups(
          subGroup,
          currentPath,
          fullBasePath,
        );
        Object.assign(groups, nestedGroups);
      }
    }
  }

  return groups;
};
