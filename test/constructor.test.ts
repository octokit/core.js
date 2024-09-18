import { Octokit } from "../src/index.ts";
import fetchMock from "fetch-mock";
import { describe, expect, it } from "vitest";

describe("Smoke test", () => {
  it("previews option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/graphql",
      { ok: true },
      {
        headers: {
          accept:
            "application/vnd.github.jean-grey-preview+json,application/vnd.github.symmetra-preview+json",
        },
      },
    );

    const octokit = new Octokit({
      previews: [
        // test with & without -preview suffix
        "jean-grey-preview",
        "symmetra",
      ],
      request: {
        fetch: mock,
      },
    });

    return octokit.request("/graphql");
  });

  it("timeZone option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "time-zone": "Europe/Amsterdam",
        },
      },
    );

    const octokit = new Octokit({
      timeZone: "Europe/Amsterdam",
      request: {
        fetch: mock,
      },
    });

    return octokit.request("GET /");
  });

  it("request option", () => {
    const octokit = new Octokit({
      request: {
        foo: "bar",
      },
    });

    octokit.hook.wrap("request", (_request, options) => {
      // @ts-ignore
      expect(options.request.foo).toEqual("bar");
      return {
        data: { ok: true },
        headers: {},
        status: 200,
        url: "https://example.com",
      };
    });

    return octokit
      .request("/")

      .then((response) => {
        expect(response.data.ok).toEqual(true);
      });
  });
});
