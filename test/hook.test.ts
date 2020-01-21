import { getUserAgent } from "universal-user-agent";
import fetchMock from "fetch-mock";

import { Octokit } from "../src";

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
      .sandbox()
      .getOnce(
        "https://api.github.com/foo/daz/baz?qux=quux&beforeAddition=works",
        { ok: true }
      );

    const octokit = new Octokit({
      request: {
        fetch: mock
      }
    });

    // We don't need to test all of before-after-hook's functionality, it's well tested itself.
    // But we do want to test common use cases in case we switch to a different hook implementation in future.
    octokit.hook.before("request", options => {
      expect(options).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/foo/:bar/baz",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
          "x-foo": "bar"
        },
        mediaType: {
          previews: ["octicon"],
          format: "rad"
        },
        bar: "daz",
        qux: "quux",
        request: {
          fetch: mock,
          hook: options.request.hook
        }
      });

      // test alternating options
      options.beforeAddition = "works";
    });

    return octokit.request("/foo/:bar/baz", {
      bar: "daz",
      qux: "quux",
      headers: {
        "x-foo": "bar"
      },
      mediaType: {
        previews: ["octicon"],
        format: "rad"
      }
    });
  });

  it("octokit.hook.after('request')", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/", { ok: true });

    const octokit = new Octokit({
      request: {
        fetch: mock
      }
    });

    octokit.hook.after("request", (response: any, requestOptions: any) => {
      expect(requestOptions).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        },
        mediaType: {
          previews: [],
          format: ""
        },
        request: {
          fetch: mock,
          hook: requestOptions.request.hook
        }
      });

      response.data.afterAddition = "works";
    });

    const { data } = await octokit.request("/");

    expect(data).toStrictEqual({
      ok: true,
      afterAddition: "works"
    });
  });

  it("octokit.hook.error('request')", async () => {
    const mock = fetchMock.sandbox().getOnce("https://api.github.com/", 500);

    const octokit = new Octokit({
      request: {
        fetch: mock
      }
    });

    octokit.hook.error("request", (error: any, requestOptions: any) => {
      expect(error.status).toEqual(500);
      expect(requestOptions).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        },
        mediaType: {
          previews: [],
          format: ""
        },
        request: {
          fetch: mock,
          hook: requestOptions.request.hook
        }
      });

      return { data: { ok: true } };
    });

    const { data } = await octokit.request("/");

    expect(data).toStrictEqual({
      ok: true
    });
  });

  it("octokit.hook.wrap('request')", async () => {
    const octokit = new Octokit({
      auth: "9c4ada1ade77b5d8bb3e5fa918b5eb4d2368c939"
    });

    octokit.hook.wrap("request", (request, options) => {
      expect((request as typeof octokit.request).endpoint).toBeInstanceOf(
        Function
      );
      expect(request).toBeInstanceOf(Function);
      expect(options).toStrictEqual({
        baseUrl: "https://api.github.com",
        method: "GET",
        url: "/",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        },
        mediaType: {
          previews: [],
          format: ""
        },
        request: {
          hook: options.request.hook
        }
      });

      return { data: { ok: true } };
    });

    const { data } = await octokit.request("/");

    expect(data).toStrictEqual({
      ok: true
    });
  });

  it("octokit.hook()", async () => {
    const octokit = new Octokit();

    let beforeMagicCalled = false;
    octokit.hook.before("magic", (options: any) => {
      beforeMagicCalled = true;
    });

    await octokit.hook("magic", (options: any) => {
      return {
        magic: true
      };
    });

    expect(beforeMagicCalled).toEqual(true);
  });
});
