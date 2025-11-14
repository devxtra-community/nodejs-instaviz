export class CustomError extends Error {
  statusCode: number;
  errorData: any;
  success: boolean = false;

  constructor({
    message,
    statusCode,
    errorData,
  }: {
    message?: string;
    statusCode?: number;
    errorData?: any;
  }) {
    super(message || "Iternal Server error");
    this.statusCode = statusCode || 500;
    this.errorData = errorData;
  }
}