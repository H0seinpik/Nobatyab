import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { changePasswordSchema } from "./user.schema.js";

describe("changePasswordSchema", () => {
  it("accepts valid passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
    });
    assert.equal(result.success, true);
  });

  it("rejects new password shorter than 6 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass1",
      newPassword: "12345",
    });
    assert.equal(result.success, false);
  });

  it("rejects empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewPass1",
    });
    assert.equal(result.success, false);
  });
});
