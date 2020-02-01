import { Octokit } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(Octokit).toBeInstanceOf(Function);
    expect(Octokit.VERSION).toEqual("0.0.0-development");
    expect(() => new Octokit()).not.toThrow();
  });
});
