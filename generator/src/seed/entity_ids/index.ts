// エンティティIDはアプリケーションごとに定義する。
// member は apps/api、admin は apps/admin_api の `src/model/id.rs` へ生成される。
export const memberEntityIds = ['UserId'] as const;
export const adminEntityIds = [] as const;

export const entityIds = {
  member: memberEntityIds,
  admin: adminEntityIds,
} as const;

export type MemberEntityId = (typeof memberEntityIds)[number];
export type AdminEntityId = (typeof adminEntityIds)[number];

export type EntityId = MemberEntityId | AdminEntityId;
