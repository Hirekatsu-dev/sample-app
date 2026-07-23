export const entityIds = [] as const;

export type EntityId = (typeof entityIds)[number];
