-- このファイルは generator/src/generators/tables.ts から生成されます。
-- 直接編集しないでください。

ALTER TABLE source.user_sessions ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES source.users (id) ON DELETE SET NULL ON UPDATE RESTRICT;
