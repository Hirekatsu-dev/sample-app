-- ローカル環境用のサンプルデータを投入する。
-- テーブルを追加したらここにも初期データを追記する。

-- ログイン確認用のサンプルユーザー
-- email:    user@example.com
-- password: hogehoge
INSERT INTO users (
  id
  ,name
  ,email
  ,password
) VALUES (
  '49f3e8b0-9bf6-4269-9d74-6fbd9fcc74a7'
  ,'サンプル太郎'
  ,'user@example.com'
  ,'$2a$12$KICOrWue6UyR6lTbzAPtF.X5Ux4n46W5UWI5pSUuxViTT8ZjnudOi'
);
