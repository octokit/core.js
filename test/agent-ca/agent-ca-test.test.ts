import { createServer, type Server } from "node:https";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetch as undiciFetch, Agent } from "undici";
import { request } from "@octokit/request";
import { type AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const __dirname = new URL(".", import.meta.url).pathname;
const ca = readFileSync(resolve(__dirname, "./ca.crt"));

describe("custom client certificate", () => {
  let server: Server;

  beforeAll(
    () =>
      new Promise((done) => {
        // Stand up a server that requires a client certificate
        // requestCert forces the server to request a certificate
        // rejectUnauthorized: false allows us to test with a self-signed certificate
        server = createServer(
          {
            key: readFileSync(resolve(__dirname, "./localhost.key")),
            cert: readFileSync(resolve(__dirname, "./localhost.crt")),
            requestCert: true,
            rejectUnauthorized: false,
          },
          (request: any, response: any) => {
            expect(request.method).toEqual("GET");
            expect(request.url).toEqual("/");

            response.writeHead(200);
            response.write("ok");
            response.end();
          },
        );

        // @ts-expect-error
        server.listen(0, done);
      }),
  );

  it("https.Agent({ca})", () => {
    // Setup a dispatcher that uses the undici agent
    const agent = new Agent({
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
      connect: { ca: ca },
    });

    const myFetch = (url: any, opts: any) => {
      return undiciFetch(url, {
        ...opts,
        dispatcher: agent,
      });
    };

    return request("/", {
      options: {
        baseUrl: "https://localhost:" + (server.address() as AddressInfo).port,
        request: {
          fetch: myFetch,
        },
      },
    });
  });

  it("https.Agent({ca, rejectUnauthorized})", () => {
    // Setup a dispatcher that uses the undici agent
    const agent = new Agent({
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
      connect: { ca: "invalid" },
    });

    const myFetch: typeof undiciFetch = (url, opts) => {
      return undiciFetch(url, {
        ...opts,
        dispatcher: agent,
      });
    };

    return request("/", {
      options: {
        baseUrl: "https://localhost:" + (server.address() as AddressInfo).port,
        request: {
          fetch: myFetch,
        },
      },
    });
  });

  afterAll(
    () =>
      new Promise((done) => {
        server.close(done);
      }),
  );
});
