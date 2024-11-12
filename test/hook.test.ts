import { getUserAgent } from "universal-user-agent";
import fetchMock from "fetch-mock";
import { describe, expect, it } from "vitest";

import { Octokit } from "../src/index.ts";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

describe("octokit.hook", () => {
  it("octokit.hook is a function", () => {
    const octokit = new Octokit();
    expect(octokit.hook).toBeInstanceOf(Function);
  });
  it(`octokit.hook.before is a function`, () => {
    const octokit = new Octokit();
    expect(octokit.hook.before).toBeInstanceOf(Function);
  });
  it(`octokit.hook.after is a function`, () => {
    const octokit = new Octokit();
    expect(octokit.hook.after).toBeInstanceOf(Function);
  });
  it(`octokit.hook.error is a function`, () => {
    const octokit = new Octokit();
    expect(octokit.hook.error).toBeInstanceOf(Function);
  });
  it(`octokit.hook.wrap is a function`, () => {
    const octokit = new Octokit();
    expect(octokit.hook.wrap).toBeInstanceOf(Function);
  });

  it("octokit.hook.before('request')", () => {
    const mock = fetchMock
      .createInstance()
      .getOnce(
        "https://api.github.com/foo/daz/baz?qux=quux&beforeAddition=works",
        { ok: true },
      );

    const octokit = new Octokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    // We don't need to test all of before-after-hook's functionality, it's well tested itself.
    // But we do want to test common use cases in case we switch to a different hook implementation in future.
    octokit.hook.before("request", (options) => {
      expect(options).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/foo/{bar}/baz",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
          "x-foo": "bar",
        },
        mediaType: {
          previews: [],
          format: "rad",
        },
        bar: "daz",
        qux: "quux",
        request: {
          fetch: mock.fetchHandler,
          // @ts-ignore
          hook: options.request.hook,
        },
      });

      // test alternating options
      options.beforeAddition = "works";
    });

    return octokit.request("/foo/{bar}/baz", {
      bar: "daz",
      qux: "quux",
      headers: {
        "x-foo": "bar",
      },
      mediaType: {
        previews: [],
        format: "rad",
      },
    });
  });

  it("octokit.hook.after('request')", async () => {
    const mock = fetchMock
      .createInstance()
      .getOnce("https://api.github.com/", { ok: true });

    const octokit = new Octokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    octokit.hook.after("request", (response: any, requestOptions: any) => {
      expect(requestOptions).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
        },
        mediaType: {
          previews: [],
          format: "",
        },
        request: {
          fetch: mock.fetchHandler,
          hook: requestOptions.request.hook,
        },
      });

      response.data.afterAddition = "works";
    });

    const { data } = await octokit.request("/");

    expect(data).toEqual({
      ok: true,
      afterAddition: "works",
    });
  });

  it("octokit.hook.error('request')", async () => {
    const mock = fetchMock
      .createInstance()
      .getOnce("https://api.github.com/", 500);

    const octokit = new Octokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    // @ts-ignore - Workaround for Node 16 (https://github.com/octokit/core.js/pull/329)
    octokit.hook.error("request", (error: any, requestOptions: any) => {
      expect(error.status).toEqual(500);
      expect(requestOptions).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
        },
        mediaType: {
          previews: [],
          format: "",
        },
        request: {
          fetch: mock.fetchHandler,
          hook: requestOptions.request.hook,
        },
      });

      return { data: { ok: true } };
    });

    const { data } = await octokit.request("/");

    expect(data).toEqual({ ok: true });
  });

  it("octokit.hook.wrap('request')", async () => {
    const octokit = new Octokit();

    octokit.hook.wrap("request", (request, options) => {
      expect(request).toBeInstanceOf(Function);
      expect(options).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
        },
        mediaType: {
          previews: [],
          format: "",
        },
        request: {
          // @ts-ignore
          hook: options.request.hook,
        },
      });

      return { data: { ok: true }, headers: {}, status: 200, url: "" };
    });

    const { data } = await octokit.request("/");

    expect(data).toEqual({ ok: true });
  });

  it("octokit.hook()", async () => {
    const octokit = new Octokit();

    let beforeMagicCalled = false;
    octokit.hook.before("magic", (_options: any) => {
      beforeMagicCalled = true;
    });

    await octokit.hook("magic", (_options: any) => {
      return {
        magic: true,
      };
    });

    expect(beforeMagicCalled).toEqual(true);
  });
});
