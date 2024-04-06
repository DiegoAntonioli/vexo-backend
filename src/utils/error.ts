class CustomError extends Error {
  statusCode: number;
  data: object;

  constructor(message?: string, statusCode?: number, data?: object) {
    super(message || "Something happened");
    this.statusCode = statusCode || 500;
    this.data = data || {};
  }
}

export { CustomError };
