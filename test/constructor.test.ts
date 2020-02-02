import { Octokit } from "../src";
import fetchMock from "fetch-mock";

describe("Smoke test", () => {
  it("previews option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept:
            "application/vnd.github.jean-grey-preview+json,application/vnd.github.symmetra-preview+json"
        }
      }
    );

    const octokit = new Octokit({
      previews: [
        // test with & without -preview suffix
        "jean-grey-preview",
        "symmetra"
      ],
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });

  it("timeZone option", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          "time-zone": "Europe/Amsterdam"
        }
      }
    );

    const octokit = new Octokit({
      timeZone: "Europe/Amsterdam",
      request: {
        fetch: mock
      }
    });

    return octokit.request("GET /").then(response => {
      expect(response.data).toStrictEqual({ ok: true });
    });
  });

  it("request option", () => {
    const octokit = new Octokit({
      request: {
        foo: "bar"
      }
    });

    octokit.hook.wrap("request", (request, options) => {
      expect(options.request.foo).toEqual("bar");
      return "ok";
    });

    return octokit
      .request("/")

      .then(response => {
        expect(response).toEqual("ok");
      });
  });
});
