import getUserAgent from "universal-user-agent";
import fetchMock from "fetch-mock";

import { Octokit } from "../src";

const userAgent = `octokit-core.js/0.0.0-development ${getUserAgent()}`;

describe("octokit.graphql()", () => {
  it.todo("is a function");
});
