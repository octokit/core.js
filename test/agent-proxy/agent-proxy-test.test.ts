/*!
 * Tests are based on work by Nathan Rajlich:
 * https://github.com/TooTallNate/node-http-proxy-agent/blob/65307ac8fe4e6ce1a2685d21ec4affa4c2a0a30d/test/test.js
 * Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net>
 * Released under the MIT license
 *
 * and on work by Rafael Gonzaga (https://github.com/RafaelGSS)
 *
 * https://github.com/nodejs/undici/blob/512cdadc403874571cd5035a6c41debab1165310/test/proxy-agent.js#L370-L418
 * Released under the MIT license
 */
import { Server, createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { type ProxyServer, createProxy } from "proxy";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { Octokit } from "../../src/index.ts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("client proxy", () => {
  let server: Server;
  let proxyServer: ProxyServer;
  let serverUrl: string;
  let proxyUrl: string;

  beforeEach(() => {
    server = createServer();
    server.listen(0, () => {});

    proxyServer = createProxy();
    proxyServer.listen(0, () => {});

    serverUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
    proxyUrl = `http://localhost:${
      (proxyServer.address() as AddressInfo).port
    }`;
  });

  it("options.request.fetch = customFetch with dispatcher: new ProxyAgent(proxyUrl)", async () => {
    let proxyConnectionEstablished = false;

    // requests are not exposed to the proxy server, they are tunneled to
    // Reference: https://github.com/advisories/GHSA-pgw7-wx7w-2w33
    // Commit: https://github.com/nodejs/undici/commit/df4f7e0e95f5112322a96fd7a666cb28c1d48327#diff-90964a82994d6c63f28161d5410c64406e6abdee4ac0759e83b1abbbe469cda4L35-R39
    proxyServer.on("connect", () => {
      proxyConnectionEstablished = true;
    });

    server.on("request", (request, response) => {
      expect(request.method).toEqual("GET");
      expect(request.url).toEqual("/");
      expect(request.headers.accept).toBe("application/vnd.github.v3+json");

      response.writeHead(200);
      response.write("ok");
      response.end();
    });

    const myFetch: typeof undiciFetch = (url, opts) => {
      return undiciFetch(url, {
        ...opts,
        dispatcher: new ProxyAgent({
          uri: proxyUrl,
          keepAliveTimeout: 10,
          keepAliveMaxTimeout: 10,
        }),
      });
    };

    const octokit = new Octokit({
      baseUrl: serverUrl,
      request: { fetch: myFetch },
    });

    await octokit.request("/");

    expect(proxyConnectionEstablished).toBeTruthy();
    expect.assertions(4);
  });

  afterEach(() => {
    server.close();
    proxyServer.close();
  });
});
