import { Agent, createServer } from "https";
import { readFileSync } from "fs";
import { resolve } from "path";

const { Octokit } = require("../../src");
const ca = readFileSync(resolve(__dirname, "./ca.crt"));

describe("custom client certificate", () => {
  let server: any;
  beforeAll(done => {
    server = createServer(
      {
        key: readFileSync(resolve(__dirname, "./localhost.key")),
        cert: readFileSync(resolve(__dirname, "./localhost.crt"))
      },
      (request: any, response: any) => {
        expect(request.method).toEqual("GET");
        expect(request.url).toEqual("/");

        response.writeHead(200);
        response.write("ok");
        response.end();
      }
    );

    server.listen(0, done);
  });

  it("https.Agent({ca})", () => {
    const agent = new Agent({
      ca
    });
    const octokit = new Octokit({
      baseUrl: "https://localhost:" + server.address().port,
      request: { agent }
    });

    return octokit.request("/");
  });

  it("https.Agent({ca, rejectUnauthorized})", () => {
    const agent = new Agent({
      ca: "invalid",
      rejectUnauthorized: false
    });
    const octokit = new Octokit({
      baseUrl: "https://localhost:" + server.address().port,
      request: { agent }
    });

    return octokit.request("/");
  });

  afterAll(done => server.close(done));
});
