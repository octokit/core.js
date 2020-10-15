import { Octokit } from "../src";
import fetchMock from "fetch-mock";

/*
  💖 Welcome, dear contributor!

  If you want to create a test that reproduces a problem reported in a GitHub issue, you came to the right place.
  Copy the "#123 example issue" test below, replace 123 with the new issue number and "example issue" with a short
  description.

  You will likely have to mock http requests, for which we use `fetch-mock`: https://www.wheresrhys.co.uk/fetch-mock/
*/

describe("issues", () => {
  test("#123 example issue", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/", { ok: true });

    const octokit = new Octokit({
      request: {
        fetch: mock,
      },
    });

    const response = await octokit.request("/");

    expect(response.status).toEqual(200);
    expect(response.data).toStrictEqual({ ok: true });
  });
});
