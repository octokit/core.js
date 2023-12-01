import { getUserAgent } from "universal-user-agent";
import fetchMock from "fetch-mock";
import { createAppAuth } from "@octokit/auth-app";
import { createActionAuth } from "@octokit/auth-action";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { install as installFakeTimers, type Clock } from "@sinonjs/fake-timers";

import { Octokit } from "../src/index.ts";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

const APP_ID = 1;
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1c7+9z5Pad7OejecsQ0bu3aozN3tihPmljnnudb9G3HECdnH
lWu2/a1gB9JW5TBQ+AVpum9Okx7KfqkfBKL9mcHgSL0yWMdjMfNOqNtrQqKlN4kE
p6RD++7sGbzbfZ9arwrlD/HSDAWGdGGJTSOBM6pHehyLmSC3DJoR/CTu0vTGTWXQ
rO64Z8tyXQPtVPb/YXrcUhbBp8i72b9Xky0fD6PkEebOy0Ip58XVAn2UPNlNOSPS
ye+Qjtius0Md4Nie4+X8kwVI2Qjk3dSm0sw/720KJkdVDmrayeljtKBx6AtNQsSX
gzQbeMmiqFFkwrG1+zx6E7H7jqIQ9B6bvWKXGwIDAQABAoIBAD8kBBPL6PPhAqUB
K1r1/gycfDkUCQRP4DbZHt+458JlFHm8QL6VstKzkrp8mYDRhffY0WJnYJL98tr4
4tohsDbqFGwmw2mIaHjl24LuWXyyP4xpAGDpl9IcusjXBxLQLp2m4AKXbWpzb0OL
Ulrfc1ZooPck2uz7xlMIZOtLlOPjLz2DuejVe24JcwwHzrQWKOfA11R/9e50DVse
hnSH/w46Q763y4I0E3BIoUMsolEKzh2ydAAyzkgabGQBUuamZotNfvJoDXeCi1LD
8yNCWyTlYpJZJDDXooBU5EAsCvhN1sSRoaXWrlMSDB7r/E+aQyKua4KONqvmoJuC
21vSKeECgYEA7yW6wBkVoNhgXnk8XSZv3W+Q0xtdVpidJeNGBWnczlZrummt4xw3
xs6zV+rGUDy59yDkKwBKjMMa42Mni7T9Fx8+EKUuhVK3PVQyajoyQqFwT1GORJNz
c/eYQ6VYOCSC8OyZmsBM2p+0D4FF2/abwSPMmy0NgyFLCUFVc3OECpkCgYEA5OAm
I3wt5s+clg18qS7BKR2DuOFWrzNVcHYXhjx8vOSWV033Oy3yvdUBAhu9A1LUqpwy
Ma+unIgxmvmUMQEdyHQMcgBsVs10dR/g2xGjMLcwj6kn+xr3JVIZnbRT50YuPhf+
ns1ScdhP6upo9I0/sRsIuN96Gb65JJx94gQ4k9MCgYBO5V6gA2aMQvZAFLUicgzT
u/vGea+oYv7tQfaW0J8E/6PYwwaX93Y7Q3QNXCoCzJX5fsNnoFf36mIThGHGiHY6
y5bZPPWFDI3hUMa1Hu/35XS85kYOP6sGJjf4kTLyirEcNKJUWH7CXY+00cwvTkOC
S4Iz64Aas8AilIhRZ1m3eQKBgQCUW1s9azQRxgeZGFrzC3R340LL530aCeta/6FW
CQVOJ9nv84DLYohTVqvVowdNDTb+9Epw/JDxtDJ7Y0YU0cVtdxPOHcocJgdUGHrX
ZcJjRIt8w8g/s4X6MhKasBYm9s3owALzCuJjGzUKcDHiO2DKu1xXAb0SzRcTzUCn
7daCswKBgQDOYPZ2JGmhibqKjjLFm0qzpcQ6RPvPK1/7g0NInmjPMebP0K6eSPx0
9/49J6WTD++EajN7FhktUSYxukdWaCocAQJTDNYP0K88G4rtC2IYy5JFn9SWz5oh
x//0u+zd/R/QRUzLOw4N72/Hu+UG6MNt5iDZFCtapRaKt6OvSBwy8w==
-----END RSA PRIVATE KEY-----`;
// see https://runkit.com/gr2m/reproducable-jwt
const BEARER =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOi0zMCwiZXhwIjo1NzAsImlzcyI6MX0.q3foRa78U3WegM5PrWLEh5N0bH1SD62OqW66ZYzArp95JBNiCbo8KAlGtiRENCIfBZT9ibDUWy82cI4g3F09mdTq3bD1xLavIfmTksIQCz5EymTWR5v6gL14LSmQdWY9lSqkgUG0XCFljWUglEP39H4yeHbFgdjvAYg3ifDS12z9oQz2ACdSpvxPiTuCC804HkPVw8Qoy0OSXvCkFU70l7VXCVUxnuhHnk8-oCGcKUspmeP6UdDnXk-Aus-eGwDfJbU2WritxxaXw6B4a3flTPojkYLSkPBr6Pi0H2-mBsW_Nvs0aLPVLKobQd4gqTkosX3967DoAG8luUMhrnxe8Q";

let clock: Clock;
beforeAll(() => {
  // Math.random is used to generate the token fingerprint,
  // unless `token.fingerprint` option was passed. The fingerprint is
  // calculated using `Math.random().toString(36).substr(2)`, so the
  // default fingerprint is always `"4feornbt361"`.
  Math.random = jest.fn().mockReturnValue(0.123);

  // A timestamp is added to the default token note, e.g.
  // "octokit 2019-07-04 4feornbt361". sinon-fake-timers mocks the Date class so
  // `new Date()` always returns `new Date(0)` by default.
  clock = installFakeTimers({
    now: 0,
    toFake: ["Date"],
  });
});

beforeEach(() => {
  clock.reset();
});

describe("Authentication", () => {
  it("new Octokit({ auth: 'secret123' })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent,
        },
      },
    );

    const octokit = new Octokit({
      auth: "secret123",
      request: {
        fetch: mock,
      },
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
          "user-agent": userAgent,
        },
      },
    );

    const octokit = new Octokit({
      auth: "token secret123",
      request: {
        fetch: mock,
      },
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
          "user-agent": userAgent,
        },
      },
    );

    const octokit = new Octokit({
      auth: "Token secret123",
      request: {
        fetch: mock,
      },
    });

    return octokit.request("/");
  });

  const BEARER_TOKEN =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NTM4MTkzMTIsImV4cCI6MTU1MzgxOTM3MiwiaXNzIjoxfQ.etiSZ4LFQZ8tiMGJVqKDoGn8hxMCgwL4iLvU5xBUqbAPr4pbk_jJZmMQjuxTlOnRxq4e7NouTizGCdfohRMb3R1mpLzGPzOH9_jqSA_BWYxolsRP_WDSjuNcw6nSxrPRueMVRBKFHrqcTOZJej0djRB5pI61hDZJ_-DGtiOIFexlK3iuVKaqBkvJS5-TbTekGuipJ652g06gXuz-l8i0nHiFJldcuIruwn28hTUrjgtPbjHdSBVn_QQLKc2Fhij8OrhcGqp_D_fvb_KovVmf1X6yWiwXV5VXqWARS-JGD9JTAr2495ZlLV_E4WPxdDpz1jl6XS9HUhMuwBpaCOuipw";
  it("new Octokit({ auth: BEARER_TOKEN })", () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/",
      { ok: true },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: `bearer ${BEARER_TOKEN}`,
          "user-agent": userAgent,
        },
      },
    );

    const octokit = new Octokit({
      auth: BEARER_TOKEN,
      request: {
        fetch: mock,
      },
    });

    return octokit.request("/");
  });

  it("auth = createOAuthAppAuth()", async () => {
    const CLIENT_ID = "0123";
    const CLIENT_SECRET = "0123secret";
    const CODE = "code123";

    const mock = fetchMock.sandbox().postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "token123",
        scope: "",
        token_type: "bearer",
      },
      {
        body: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: CODE,
        },
      },
    );

    const MyOctokit = Octokit.defaults({
      authStrategy: createOAuthAppAuth,
      request: {
        fetch: mock,
      },
    });

    const octokit = new MyOctokit({
      auth: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
    });

    await octokit.auth({
      type: "oauth-user",
      code: CODE,
    });

    expect(mock.done()).toBe(true);
  });

  it("auth = createAppAuth()", async () => {
    const mock = fetchMock
      .sandbox()
      .postOnce("https://api.github.com/app/installations/123/access_tokens", {
        token: "secret123",
        expires_at: "1970-01-01T01:00:00.000Z",
        permissions: {
          metadata: "read",
        },
        repository_selection: "all",
      })
      .get(
        "https://api.github.com/repos/octocat/hello-world",
        { id: 123 },
        {
          headers: {
            authorization: "token secret123",
          },
          repeat: 2,
        },
      )
      .getOnce(
        "https://api.github.com/app",
        { id: 123 },
        {
          headers: {
            accept: "application/vnd.github.v3+json",
            "user-agent": userAgent,
            authorization: `bearer ${BEARER}`,
          },
        },
      );

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: APP_ID,
        privateKey: PRIVATE_KEY,
        installationId: 123,
      },
      request: {
        fetch: mock,
      },
    });

    await octokit.request("GET /repos/octocat/hello-world");
    await octokit.request("GET /repos/octocat/hello-world");

    await octokit.request("GET /app");

    expect(mock.done()).toBe(true);
  });

  it("auth = createActionAuth()", async () => {
    const mock = fetchMock.sandbox().getOnce(
      "https://api.github.com/app",
      { id: 123 },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: `token githubtoken123`,
          "user-agent": userAgent,
        },
      },
    );
    const currentEnv = process.env;
    process.env = {
      GITHUB_ACTION: "1",
      GITHUB_TOKEN: "githubtoken123",
    };

    const octokit = new Octokit({
      authStrategy: createActionAuth,
      request: {
        fetch: mock,
      },
    });

    await octokit.request("/app");
    process.env = currentEnv;
  });

  it("octokit.auth() is noop by default", async () => {
    const octokit = new Octokit();
    const result = await octokit.auth();
    expect(result).toStrictEqual({ type: "unauthenticated" });
  });

  it("octokit.auth() with options.auth = secret", async () => {
    const octokit = new Octokit({
      auth: "secret",
    });
    const result = await octokit.auth();
    expect(result).toStrictEqual({
      type: "token",
      tokenType: "oauth",
      token: "secret",
    });
  });

  it("createAppAuth with GraphQL + GHES (probot/probot#1386)", async () => {
    const mock = fetchMock
      .sandbox()
      .postOnce(
        "https://fake.github-enterprise.com/api/v3/app/installations/123/access_tokens",
        {
          token: "secret123",
          expires_at: "1970-01-01T01:00:00.000Z",
          permissions: {
            metadata: "read",
          },
          repository_selection: "all",
        },
      )
      .postOnce(
        "https://fake.github-enterprise.com/api/graphql",
        { ok: true },
        {
          headers: {
            authorization: "token secret123",
          },
        },
      );

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: APP_ID,
        privateKey: PRIVATE_KEY,
        installationId: 123,
      },
      baseUrl: "https://fake.github-enterprise.com/api/v3",
      request: {
        fetch: mock,
      },
    });

    await octokit.graphql(`query { 
      viewer { 
        login
      }
    }`);

    expect(mock.done()).toBe(true);
  });

  it("should pass through the logger (#1277)", async () => {
    const mock = fetchMock
      .sandbox()
      .postOnce("https://api.github.com/app/installations/2/access_tokens", {
        token: "installation-token-123",
        permissions: {},
      })
      .getOnce("https://api.github.com/repos/octokit/core.js", 401)
      .getOnce(
        "https://api.github.com/repos/octokit/core.js",
        { ok: true },
        { overwriteRoutes: false },
      );

    const mockWarnLogger = jest.fn();

    const octokit = new Octokit({
      log: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: mockWarnLogger,
        error: jest.fn(),
      },
      authStrategy: createAppAuth,
      auth: {
        appId: 1,
        privateKey: PRIVATE_KEY,
        installationId: 2,
      },
      request: {
        fetch: mock,
      },
    });

    await octokit.request("GET /repos/octokit/core.js");

    expect(mockWarnLogger.mock.calls.length).toBe(1);
    expect(mockWarnLogger.mock.calls[0][0]).toBe(
      "[@octokit/auth-app] Retrying after 401 response to account for token replication delay (retry: 1, wait: 1s)",
    );
  });

  it("should pass octokit and octokitOptions if a custom authStrategy was set", () => {
    const authStrategy = jest.fn().mockReturnValue({
      hook() {},
    });
    new Octokit({
      authStrategy,
      auth: {
        secret: "123",
      },
      someUnrelatedOption: "value",
    });

    const strategyOptions = authStrategy.mock.calls[0][0];

    expect(Object.keys(strategyOptions).sort()).toStrictEqual([
      "log",
      "octokit",
      "octokitOptions",
      "request",
      "secret",
    ]);
    expect(strategyOptions.octokitOptions).toStrictEqual({
      auth: {
        secret: "123",
      },
      someUnrelatedOption: "value",
    });
  });
});
