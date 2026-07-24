export const entityIds = ['UserId'] as const;

export type EntityId = (typeof entityIds)[number];
