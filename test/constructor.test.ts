import { Octokit } from "../src";
import fetchMock from "fetch-mock";

describe("Smoke test", () => {
  it("timeZone option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
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
