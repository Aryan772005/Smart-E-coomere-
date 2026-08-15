export type SortDirection = "asc" | "desc";

export interface PageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FieldError {
  field?: string;
  code: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  errors?: FieldError[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload?.message ?? "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface ApiSuccess<T> {
  data: T;
}

export interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
