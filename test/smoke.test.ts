import { Core } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(Core).toBeInstanceOf(Function);
    expect(Core).not.toThrow();
  });
});
