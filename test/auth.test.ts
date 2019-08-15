import getUserAgent from "universal-user-agent";
import fetchMock from "fetch-mock";

import { Octokit } from "../src";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

describe("Authentication", () => {
  it("new Octokit({ auth: 'secret123' })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent
        }
      }
    );

    const octokit = new Octokit({
      auth: "secret123",
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });

  it("new Octokit({ auth: 'token secret123' })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent
        }
      }
    );

    const octokit = new Octokit({
      auth: "token secret123",
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });

  it("new Octokit({ auth: 'Token secret123' })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent
        }
      }
    );

    const octokit = new Octokit({
      auth: "Token secret123",
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });

  const BEARER_TOKEN =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NTM4MTkzMTIsImV4cCI6MTU1MzgxOTM3MiwiaXNzIjoxfQ.etiSZ4LFQZ8tiMGJVqKDoGn8hxMCgwL4iLvU5xBUqbAPr4pbk_jJZmMQjuxTlOnRxq4e7NouTizGCdfohRMb3R1mpLzGPzOH9_jqSA_BWYxolsRP_WDSjuNcw6nSxrPRueMVRBKFHrqcTOZJej0djRB5pI61hDZJ_-DGtiOIFexlK3iuVKaqBkvJS5-TbTekGuipJ652g06gXuz-l8i0nHiFJldcuIruwn28hTUrjgtPbjHdSBVn_QQLKc2Fhij8OrhcGqp_D_fvb_KovVmf1X6yWiwXV5VXqWARS-JGD9JTAr2495ZlLV_E4WPxdDpz1jl6XS9HUhMuwBpaCOuipw";
  it("new Octokit({ auth: `bearer ${BEARER_TOKEN}` })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: `bearer ${BEARER_TOKEN}`,
          "user-agent": userAgent
        }
      }
    );

    const octokit = new Octokit({
      auth: `bearer ${BEARER_TOKEN}`,
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });
  it("new Octokit({ auth: BEARER_TOKEN })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: `bearer ${BEARER_TOKEN}`,
          "user-agent": userAgent
        }
      }
    );

    const octokit = new Octokit({
      auth: BEARER_TOKEN,
      request: {
        fetch: mock
      }
    });

    return octokit.request("/");
  });
});
