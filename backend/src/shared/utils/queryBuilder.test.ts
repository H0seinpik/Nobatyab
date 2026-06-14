import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildListQuery,
  categoryListConfig,
  serviceListConfig,
  userListConfig,
} from "./queryBuilder.js";

describe("buildListQuery name filters", () => {
  it("applies category name contains filter", () => {
    const built = buildListQuery(categoryListConfig, {
      page: 1,
      filter: JSON.stringify({ name: { op: "contains", value: "med" } }),
    });

    assert.deepEqual(built.where, {
      name: { contains: "med", mode: "insensitive" },
    });
  });

  it("applies service name contains filter", () => {
    const built = buildListQuery(serviceListConfig, {
      page: 1,
      filter: JSON.stringify({ name: { op: "contains", value: "skin" } }),
    });

    assert.deepEqual(built.where, {
      name: { contains: "skin", mode: "insensitive" },
    });
  });

  it("applies user fullName contains filter", () => {
    const built = buildListQuery(userListConfig, {
      page: 1,
      filter: JSON.stringify({ fullName: { op: "contains", value: "ali" } }),
    });

    assert.deepEqual(built.where, {
      fullName: { contains: "ali", mode: "insensitive" },
    });
  });

  it("ignores empty name contains filter", () => {
    const built = buildListQuery(categoryListConfig, {
      page: 1,
      filter: JSON.stringify({ name: { op: "contains", value: "" } }),
    });

    assert.deepEqual(built.where, {});
  });
});
