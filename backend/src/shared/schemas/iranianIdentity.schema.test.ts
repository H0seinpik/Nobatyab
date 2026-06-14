import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidNationalCode } from "./iranianIdentity.schema.js";

describe("isValidNationalCode", () => {
  it("accepts a valid checksum code", () => {
    assert.equal(isValidNationalCode("0499370899"), true);
  });

  it("rejects invalid checksum", () => {
    assert.equal(isValidNationalCode("1234567890"), false);
  });

  it("rejects repeated digits", () => {
    assert.equal(isValidNationalCode("0000000000"), false);
  });

  it("rejects wrong length", () => {
    assert.equal(isValidNationalCode("12345"), false);
  });
});
