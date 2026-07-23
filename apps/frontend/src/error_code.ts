// このファイルは generator/src/generators/errors.ts から生成されます。
// 直接編集しないでください。

export const ApiErrorCode = {
		Unknown: 'E0001',	// 不明なエラーが発生しました。
		InvalidParameter: 'E0002',	// パラメータが不正です。
		LoginFailure: 'E0003',	// ログインに失敗しました。
		NotFound: 'E0004',	// データが見つかりませんでした。
		SessionExpired: 'E0005',	// セッションが失効しました。
} as const;
