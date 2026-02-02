export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string | string[];
  data: T;
  path?: string;
  timestamp?: string;
};
