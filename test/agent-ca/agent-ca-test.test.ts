import { createServer } from "https";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fetch as undiciFetch, Agent } from "undici";
import { request } from "@octokit/request";

const ca = readFileSync(resolve(__dirname, "./ca.crt"));

// TODO: rewrite tests to use fetch dispatchers
describe("custom client certificate", () => {
  let server: any;
  // let myFetch: any;

  beforeAll((done) => {
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

    server.listen(0, done);
  });

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
        baseUrl: "https://localhost:" + server.address().port,
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

    const myFetch = (url: any, opts: any) => {
      return undiciFetch(url, {
        ...opts,
        dispatcher: agent,
      });
    };

    return request("/", {
      options: {
        baseUrl: "https://localhost:" + server.address().port,
        request: {
          fetch: myFetch,
        },
      },
    });
  });

  afterAll((done) => {
    server.close(done);
  });
});
