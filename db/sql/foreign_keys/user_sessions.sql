-- このファイルは generator/src/generators/tables.ts から生成されます。
-- 直接編集しないでください。

ALTER TABLE public.user_sessions ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE ON UPDATE RESTRICT;
