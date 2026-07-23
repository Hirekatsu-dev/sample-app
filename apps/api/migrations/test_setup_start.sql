-- このファイルは generator/src/generators/tables.ts から生成されます。
-- 直接編集しないでください。

DROP TABLE IF EXISTS source.users CASCADE;
CREATE TABLE source.users (
  id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,name TEXT NOT NULL DEFAULT ''	 -- 名前
  ,email TEXT NOT NULL DEFAULT ''	 -- Eメール
  ,password TEXT NOT NULL DEFAULT ''	 -- パスワード
  ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()	 -- 日時
  ,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()	 -- 日時
  ,deleted_at TIMESTAMPTZ DEFAULT NULL	 -- 日時
  ,created_id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,updated_id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,deleted_id UUID DEFAULT gen_random_uuid()	 -- ID
  ,meta_json JSONB NOT NULL DEFAULT '{}'	 -- JSON
  ,PRIMARY KEY (id)
);

CREATE TABLE public.users () INHERITS (source.users);
CREATE TABLE garbage.users () INHERITS (source.users);

CREATE UNIQUE INDEX idx_users_email ON public.users USING BTREE (email);

DROP TABLE IF EXISTS source.user_sessions CASCADE;
CREATE TABLE source.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,user_id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,access_token_code TEXT NOT NULL DEFAULT ''	 -- アクセストークン_コード
  ,expire_at TIMESTAMPTZ NOT NULL DEFAULT NOW()	 -- 失効_日時
  ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()	 -- 日時
  ,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()	 -- 日時
  ,deleted_at TIMESTAMPTZ DEFAULT NULL	 -- 日時
  ,created_id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,updated_id UUID NOT NULL DEFAULT gen_random_uuid()	 -- ID
  ,deleted_id UUID DEFAULT gen_random_uuid()	 -- ID
  ,meta_json JSONB NOT NULL DEFAULT '{}'	 -- JSON
  ,PRIMARY KEY (id)
);

CREATE TABLE public.user_sessions () INHERITS (source.user_sessions);
CREATE TABLE garbage.user_sessions () INHERITS (source.user_sessions);

CREATE UNIQUE INDEX idx_user_sessions_access_token_code ON public.user_sessions USING BTREE (access_token_code);

-- 外部キー制約をまとめて最後に追加
ALTER TABLE source.user_sessions ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES source.users (id) ON DELETE SET NULL ON UPDATE RESTRICT;
