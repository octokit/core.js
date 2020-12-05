import { getUserAgent } from "universal-user-agent";
import fetchMock from "fetch-mock";

import { Octokit } from "../src";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

describe("octokit.request()", () => {
  it("is a function", () => {
    const octokit = new Octokit();
    expect(octokit.request).toBeInstanceOf(Function);
  });

  it("GET /", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
        },
      }
    );

    const octokit = new Octokit({
      request: {
        fetch: mock,
      },
    });

    return octokit.request("GET /");
  });

  it("custom baseUrl", () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://github.acme-inc.com/api/v3/orgs/octokit", { id: 123 });

    const octokit = new Octokit({
      baseUrl: "https://github.acme-inc.com/api/v3",
      request: {
        fetch: mock,
      },
    });

    return octokit.request("GET /orgs/{org}", {
      org: "octokit",
    });
  });

  it("custom user agent", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": `myApp/1.2.3 ${userAgent}`,
        },
      }
    );

    const octokit = new Octokit({
      userAgent: "myApp/1.2.3",
      request: {
        fetch: mock,
      },
    });

    return octokit.request("GET /");
  });

  it("custom time zone", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
          "time-zone": "Europe/Amsterdam",
        },
      }
    );

    const octokit = new Octokit({
      timeZone: "Europe/Amsterdam",
      request: {
        fetch: mock,
      },
    });

    return octokit.request("GET /");
  });

  it("previews", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce(
        "https://api.github.com/",
        {},
        {
          headers: {
            accept:
              "application/vnd.github.foo-preview+json,application/vnd.github.bar-preview+json",
            "user-agent": userAgent,
          },
        }
      )
      .getOnce(
        "https://api.github.com/",
        {},
        {
          headers: {
            accept:
              "application/vnd.github.foo-preview.raw,application/vnd.github.bar-preview.raw,application/vnd.github.baz-preview.raw",
            "user-agent": userAgent,
          },
          overwriteRoutes: false,
        }
      );

    const octokit = new Octokit({
      previews: ["foo", "bar-preview"],
      request: {
        fetch: mock,
      },
    });

    await octokit.request("/");
    await octokit.request("/", {
      mediaType: {
        previews: ["bar", "baz-preview"],
        format: "raw",
      },
    });
  });

  it('octokit.request.endpoint("GET /")', () => {
    const octokit = new Octokit();
    const requestOptions = octokit.request.endpoint("GET /");

    expect(requestOptions).toStrictEqual({
      method: "GET",
      // @ts-ignore
      url: "https://api.github.com/",
      headers: {
        accept: "application/vnd.github.v3+json",
        "user-agent": userAgent,
      },
      request: {
        // @ts-ignore
        hook: requestOptions.request.hook,
      },
    });
  });

  it("sends null values (octokit/rest.js#765)", () => {
    const mock = fetchMock.sandbox().patchOnce(
      "https://api.github.com/repos/epmatsw/example-repo/issues/1",
      {},
      {
        body: {
          milestone: null,
        },
      }
    );

    const octokit = new Octokit({
      auth: "secret123",
      request: {
        fetch: mock,
      },
    });
    return octokit.request(
      "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: "epmatsw",
        repo: "example-repo",
        milestone: null,
        issue_number: 1,
      }
    );
  });
});
