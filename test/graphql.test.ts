import { getUserAgent } from "universal-user-agent";
import fetchMock from "fetch-mock";

import { Octokit } from "../src";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

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
      .postOnce("https://api.github.com/graphql", (url, request) => {
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
      .postOnce("https://github.acme-inc.com/api/graphql", (url, request) => {
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
});
