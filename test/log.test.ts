import { describe, expect, it, vi } from "vitest";

describe("octokit.log", () => {
  it(".debug() and .info() are no-ops by default", async () => {
    const calls: String[] = [];

    const debug = vi
      .spyOn(console, "debug")
      .mockImplementation(() => calls.push("debug"));
    const info = vi
      .spyOn(console, "info")
      .mockImplementation(() => calls.push("info"));
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => calls.push("warn"));
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => calls.push("error"));
    const Octokit = (await import("../src/index.ts")).Octokit;

    const octokit = new Octokit();

    octokit.log.debug("foo");
    octokit.log.info("bar");
    octokit.log.warn("baz");
    octokit.log.error("daz");

    expect(octokit.log.debug.name).toBe("noop");
    expect(octokit.log.info.name).toBe("noop");

    expect(debug).toHaveBeenCalledTimes(0);
    expect(info).toHaveBeenCalledTimes(0);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(calls).toStrictEqual(["warn", "error"]);

    debug.mockRestore();
    info.mockRestore();
    warn.mockRestore();
    error.mockRestore();
  });

  it("has .debug(), .info(), .warn(), and .error() functions", async () => {
    const Octokit = (await import("../src/index.ts")).Octokit;

    const octokit = new Octokit();
    expect(typeof octokit.log.debug).toBe("function");
    expect(typeof octokit.log.info).toBe("function");
    expect(typeof octokit.log.warn).toBe("function");
    expect(typeof octokit.log.error).toBe("function");
  });

  it("all .log.*() methods can be overwritten", async () => {
    const Octokit = (await import("../src/index.ts")).Octokit;
    const calls: String[] = [];

    const octokit = new Octokit({
      log: {
        debug: () => calls.push("debug"),
        info: () => calls.push("info"),
        warn: () => calls.push("warn"),
        error: () => calls.push("error"),
      },
    });

    octokit.log.debug("foo");
    octokit.log.info("bar");
    octokit.log.warn("baz");
    octokit.log.error("daz");

    expect(calls).toStrictEqual(["debug", "info", "warn", "error"]);
  });
});
