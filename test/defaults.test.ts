import fetchMock from "fetch-mock";
import { getUserAgent } from "universal-user-agent";
import { createActionAuth } from "@octokit/auth";

import { Octokit } from "../src";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

describe("Octokit.defaults", () => {
  it("is a function", () => {
    expect(Octokit.defaults).toBeInstanceOf(Function);
  });

  it("Octokit.defaults({baseUrl})", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://github.acme-inc.test/api/v3/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        }
      }
    );

    const OctokitWithDefaults = Octokit.defaults({
      baseUrl: "https://github.acme-inc.test/api/v3",
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithDefaults();

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("Octokit.defaults({userAgent})", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": `my-app/1.2.3 ${userAgent}`
        }
      }
    );

    const OctokitWithDefaults = Octokit.defaults({
      userAgent: "my-app/1.2.3",
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithDefaults();

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("Octokit.defaults({userAgent}) with userAgent Constructor Option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": `my-app/1.2.3 my-octokit.js/1.2.3 ${userAgent}`
        }
      }
    );

    const OctokitWithDefaults = Octokit.defaults({
      userAgent: "my-octokit.js/1.2.3",
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithDefaults({
      userAgent: "my-app/1.2.3"
    });

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("Octokit.defaults({timeZone})", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
          "time-zone": "Europe/Amsterdam"
        }
      }
    );

    const OctokitWithDefaults = Octokit.defaults({
      timeZone: "Europe/Amsterdam",
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithDefaults();

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("Octokit.defaults({ auth })", async () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/app",
      { id: 123 },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: `token githubtoken123`,
          "user-agent": userAgent
        }
      }
    );
    const currentEnv = process.env;
    process.env = {
      GITHUB_ACTION: "1",
      GITHUB_TOKEN: "githubtoken123"
    };

    const OctokitWithDefaults = Octokit.defaults({
      authStrategy: createActionAuth,
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithDefaults();

    await octokit.request("/app");
    process.env = currentEnv;
  });

  it("Octokit.defaults().defaults()", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://github.acme-inc.test/api/v3/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": `my-app/1.2.3 ${userAgent}`
        }
      }
    );

    const OctokitWithDefaults = Octokit.defaults({
      baseUrl: "https://github.acme-inc.test/api/v3",
      request: {
        fetch: mock
      }
    }).defaults({
      userAgent: "my-app/1.2.3"
    });

    const octokit = new OctokitWithDefaults();

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("Octokit.plugin().defaults()", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://github.acme-inc.test/api/v3/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        }
      }
    );

    const OctokitWithPluginAndDefaults = Octokit.plugin(() => {
      return {
        foo: "bar"
      };
    }).defaults({
      baseUrl: "https://github.acme-inc.test/api/v3",
      request: {
        fetch: mock
      }
    });

    const octokit = new OctokitWithPluginAndDefaults();

    expect(octokit.foo).toEqual("bar");

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });
});
