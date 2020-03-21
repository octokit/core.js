import { Octokit } from "../src";

describe("octokit.log", () => {
  it("has .debug(), .info(), .warn(), and .error() functions", () => {
    const octokit = new Octokit();
    expect(typeof octokit.log.debug).toBe("function");
    expect(typeof octokit.log.info).toBe("function");
    expect(typeof octokit.log.warn).toBe("function");
    expect(typeof octokit.log.error).toBe("function");
  });

  it(".debug() and .info() are no-ops by default", () => {
    const originalLogDebug = console.debug;
    const originalLogInfo = console.info;
    const originalLogWarn = console.warn;
    const originalLogError = console.error;

    const calls: String[] = [];
    console.debug = () => calls.push("debug");
    console.info = () => calls.push("info");
    console.warn = () => calls.push("warn");
    console.error = () => calls.push("error");

    const octokit = new Octokit();

    octokit.log.debug("foo");
    octokit.log.info("bar");
    octokit.log.warn("baz");
    octokit.log.error("daz");

    console.debug = originalLogDebug;
    console.info = originalLogInfo;
    console.warn = originalLogWarn;
    console.error = originalLogError;

    expect(calls).toStrictEqual(["warn", "error"]);
  });

  it("all .log.*() methods can be overwritten", () => {
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
