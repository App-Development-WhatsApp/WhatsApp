class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: string[];
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = [],
    stack: string = ""
  ) {
    super(message);
    // Setting the properties
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    // Optional stack property
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
