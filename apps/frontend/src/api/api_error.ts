export class ApiError extends Error {
  public readonly resultCode: string | undefined;
  public readonly statusCode: number | undefined;

  constructor(message: string, statusCode?: number, resultCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.resultCode = resultCode;
  }

  get isNetworkError(): boolean {
    return this.statusCode === undefined;
  }
}
