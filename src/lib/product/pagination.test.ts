import { describe, expect, it } from "vitest";
import { getPagination, paginateItems } from "./pagination";

describe("pagination", () => {
  it("returns a bounded page slice with metadata", () => {
    const result = paginateItems(["a", "b", "c", "d", "e"], {
      page: 2,
      pageSize: 2,
    });

    expect(result.items).toEqual(["c", "d"]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.hasPreviousPage).toBe(true);
    expect(result.hasNextPage).toBe(true);
  });

  it("normalizes invalid page values into the available range", () => {
    expect(getPagination({ totalItems: 3, page: 99, pageSize: 2 })).toMatchObject({
      page: 2,
      totalPages: 2,
    });
    expect(getPagination({ totalItems: 0, page: -1, pageSize: 2 })).toMatchObject({
      page: 1,
      totalPages: 1,
    });
  });
});
