/*!
 * Tests are based on work by Nathan Rajlich:
 * https://github.com/TooTallNate/node-http-proxy-agent/blob/65307ac8fe4e6ce1a2685d21ec4affa4c2a0a30d/test/test.js
 *
 * Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net>
 * Released under the MIT license
 */
const http = require("http");

const { createProxy } = require("proxy");
const { HttpProxyAgent } = require("http-proxy-agent");

import { Octokit } from "../../src";

describe.skip("client proxy", () => {
  let proxy: any;
  let proxyUrl: string;

  // start HTTP proxy & http server
  beforeAll((done) => {
    proxy = createProxy();
    proxy.listen(() => {
      proxyUrl = "http://localhost:" + proxy.address().port;
      done();
    });
  });

  let server: any;
  beforeAll((done) => {
    server = http.createServer((request: any, response: any) => {
      expect(request.method).toEqual("GET");
      expect(request.url).toEqual("/");

      response.writeHead(200);
      response.write("ok");
      response.end();
    });

    server.listen(0, done);
  });

  // stop proxy HTTP & http server
  afterAll((done) => {
    proxy.once("close", () => done());
    proxy.close();
  });

  afterAll((done) => {
    server.close(done);
  });

  it("options.agent = new HttpProxyAgent(proxyUrl)", async () => {
    let proxyReceivedRequest;

    proxy.once("request", (request: any) => {
      expect(request.headers.accept).toBe("application/vnd.github.v3+json");
      proxyReceivedRequest = true;
    });

    const octokit = new Octokit({
      baseUrl: "http://localhost:" + server.address().port,
      request: { agent: new HttpProxyAgent(proxyUrl) },
    });

    await octokit.request("/");

    expect(proxyReceivedRequest).toBe(true);
  });
});
