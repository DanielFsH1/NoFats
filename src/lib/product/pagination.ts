export type PaginationInput = {
  totalItems: number;
  page?: number;
  pageSize: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function getPagination({
  totalItems,
  page = 1,
  pageSize,
}: PaginationInput): Pagination {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safeTotalItems = Math.max(0, Math.floor(totalItems));
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  const normalizedPage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
  );

  return {
    page: normalizedPage,
    pageSize: safePageSize,
    totalItems: safeTotalItems,
    totalPages,
    hasPreviousPage: normalizedPage > 1,
    hasNextPage: normalizedPage < totalPages,
  };
}

export function paginateItems<T>(
  items: T[],
  input: Omit<PaginationInput, "totalItems">,
) {
  const pagination = getPagination({
    totalItems: items.length,
    page: input.page,
    pageSize: input.pageSize,
  });
  const start = (pagination.page - 1) * pagination.pageSize;

  return {
    ...pagination,
    items: items.slice(start, start + pagination.pageSize),
  };
}

export function parsePageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue ?? 1);

  return Number.isFinite(page) ? page : 1;
}
