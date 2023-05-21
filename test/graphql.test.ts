import fetchMock from "fetch-mock";

import { Octokit } from "../src";

describe("octokit.graphql()", () => {
  it("is a function", () => {
    const octokit = new Octokit();
    expect(octokit.graphql).toBeInstanceOf(Function);
  });

  it("README usage example", async () => {
    const mockResult = {
      organization: {
        repositories: {
          totalCount: 123,
        },
      },
    };
    const mock = fetchMock
      .sandbox()
      .postOnce("https://api.github.com/graphql", (_url, request) => {
        const body = JSON.parse(request.body!.toString());
        expect(body.query).toEqual(query);

        return {
          data: mockResult,
        };
      });

    const octokit = new Octokit({
      auth: `secret123`,
      request: {
        fetch: mock,
      },
    });

    const query = `query ($login: String!) {
      organization(login: $login) {
        repositories(privacy: PRIVATE) {
          totalCount
        }
      }
    }`;

    const result = await octokit.graphql(query, { login: "octokit" });

    expect(result).toStrictEqual(mockResult);
  });

  it("GitHub Enterprise Server usage (with option.baseUrl)", async () => {
    const mockResult = {
      organization: {
        repositories: {
          totalCount: 123,
        },
      },
    };
    const mock = fetchMock
      .sandbox()
      .postOnce("https://github.acme-inc.com/api/graphql", (_url, request) => {
        const body = JSON.parse(request.body!.toString());
        expect(body.query).toEqual(query);

        return {
          data: mockResult,
        };
      });

    const octokit = new Octokit({
      auth: `secret123`,
      baseUrl: "https://github.acme-inc.com/api/v3",
      request: {
        fetch: mock,
      },
    });

    const query = `query ($login: String!) {
      organization(login: $login) {
        repositories(privacy: PRIVATE) {
          totalCount
        }
      }
    }`;

    const result = await octokit.graphql(query, { login: "octokit" });

    expect(result).toStrictEqual(mockResult);
  });

  it("custom headers: octokit.graphql({ query, headers })", async () => {
    const mock = fetchMock
      .sandbox()
      .postOnce("https://api.github.com/graphql", (_url, request) => {
        // @ts-ignore `request.headers` are typed incorrectly by fetch-mock
        expect(request.headers["x-custom"]).toEqual("value");

        return {
          data: { ok: true },
        };
      });

    const octokit = new Octokit({
      auth: `secret123`,
      request: {
        fetch: mock,
      },
    });

    const result = await octokit.graphql({
      query: "",
      headers: {
        "x-custom": "value",
      },
    });

    expect(result).toStrictEqual({ ok: true });
  });

  it("custom headers: octokit.graphql(query, { headers })", async () => {
    const mock = fetchMock
      .sandbox()
      .postOnce("https://api.github.com/graphql", (_url, request) => {
        // @ts-ignore `request.headers` are typed incorrectly by fetch-mock
        expect(request.headers["x-custom"]).toEqual("value");

        const body = JSON.parse(request.body!.toString());
        expect(body.variables).toEqual({ foo: "bar" });

        return {
          data: { ok: true },
        };
      });

    const octokit = new Octokit({
      auth: `secret123`,
      request: {
        fetch: mock,
      },
    });

    const result = await octokit.graphql("", {
      headers: {
        "x-custom": "value",
      },
      foo: "bar",
    });

    expect(result).toStrictEqual({ ok: true });
  });
});
