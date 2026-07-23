-- このファイルはサンプルです。実際には適用されていません。

BEGIN;

ALTER TABLE source.users ADD COLUMN bio TEXT NOT NULL DEFAULT '';	 -- 自己紹介

-- 期待通りの結果にならなかった場合はロールバック
-- ROLLBACK;

-- 問題なければコミット
-- COMMIT;
