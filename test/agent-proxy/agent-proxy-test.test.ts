/*!
 * Tests are based on work by Nathan Rajlich:
 * https://github.com/TooTallNate/node-http-proxy-agent/blob/65307ac8fe4e6ce1a2685d21ec4affa4c2a0a30d/test/test.js
 *
 * Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net>
 * Released under the MIT license
 */
import { createServer } from "http";
import { type AddressInfo } from "net";
import { createProxy } from "proxy";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { Octokit } from "../../src";

const server = createServer();
server.listen(0, () => {});

const proxyServer = createProxy();
proxyServer.listen(0, () => {});

const serverUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
const proxyUrl = `http://localhost:${
  (proxyServer.address() as AddressInfo).port
}`;

server.on("request", (request, response) => {
  expect(request.method).toEqual("GET");
  expect(request.url).toEqual("/");

  response.writeHead(200);
  response.write("ok");
  response.end();
});

describe("client proxy", () => {
  it("options.request.fetch = customFetch with dispatcher: new ProxyAgent(proxyUrl)", async () => {
    let proxyReceivedRequest = false;

    proxyServer.on("request", (request) => {
      console.log("proxyRequest", request.headers);
      expect(request.headers.accept).toBe("application/vnd.github.v3+json");
      proxyReceivedRequest = true;
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

    expect(proxyReceivedRequest).toBe(true);
    expect.assertions(4);
  });
});
