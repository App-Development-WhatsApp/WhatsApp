class ApiResponse<T> {
  statusCode: number;
  data?: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, message?: string, data?: T) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.message = message ?? (this.success ? "Success" : "Error");
  }
}

export { ApiResponse };
