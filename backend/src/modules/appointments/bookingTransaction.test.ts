import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { duplicateBookingError } from "./bookingTransaction.js";

describe("duplicateBookingError", () => {
  it("returns a 409 conflict with expected message", () => {
    const err = duplicateBookingError();
    assert.equal(err.statusCode, 409);
    assert.equal(err.message, "این زمان قبلاً رزرو شده است");
    assert.equal(err.code, "CONFLICT");
  });
});
