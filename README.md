# core.js

[![@latest](https://img.shields.io/npm/v/@octokit/core.svg)](https://www.npmjs.com/package/@octokit/core)
[![Build Status](https://travis-ci.org/octokit/core.js.svg?branch=master)](https://travis-ci.org/octokit/core.js)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/core.js.svg)](https://greenkeeper.io/)

> Extendable client for GitHub's REST & GraphQL APIs

<!-- toc -->

- [Usage](#usage)
  - [REST API example](#rest-api-example)
  - [GraphQL example](#graphql-example)
- [Authentication](#authentication)
- [Hooks](#hooks)
- [Plugins](#plugins)
- [LICENSE](#license)

<!-- tocstop -->

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>
Load <code>@octokit/core</code> directly from <a href="https://cdn.pika.dev">cdn.pika.dev</a>
        
```html
<script type="module">
import { Octokit } from "https://cdn.pika.dev/@octokit/core";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install @octokit/core</code>

```js
const { Octokit } = require("@octokit/core");
// or: import { Octokit } from "@octokit/core";
```

</td></tr>
</tbody>
</table>

### REST API example

```js
const octokit = new Octokit({ auth: `secret123` });

const response = await octokit.request("GET /orgs/:org/repos", {
  org: "octokit",
  type: "private"
});
```

See https://github.com/octokit/request.js for full documentation of the `.request` method.

### GraphQL example

```js
const octokit = new Octokit({ auth: `secret123` });

const response = await octokit.graphql(
  `query ($login: String!) {
    organization(login: $login) {
      repositories(privacy: PRIVATE) {
        totalCount
      }
    }
  }`,
  { login: "octokit" }
);
```

See https://github.com/octokit/graphql.js for full documentation of the `.graphql` method.

## Authentication

The `auth` option is a string and can be one of

1. A personal access token
1. An OAuth token
1. A GitHub App installation token
1. A GitHub App JSON Web Token
1. A GitHub Action token (`GITHUB_TOKEN` environment variable)

More complex authentication strategies will be supported by passing an [@octokit/auth](https://github.com/octokit/auth.js) instance (🚧 currently work in progress).

## Hooks

You can customize Octokit's request lifecycle with hooks.

```js
octokit.hook.before("request", async options => {
  validate(options);
});
octokit.hook.after("request", async (response, options) => {
  console.log(`${options.method} ${options.url}: ${response.status}`);
});
octokit.hook.error("request", async (error, options) => {
  if (error.status === 304) {
    return findInCache(error.headers.etag);
  }

  throw error;
});
octokit.hook.wrap("request", async (request, options) => {
  // add logic before, after, catch errors or replace the request altogether
  return request(options);
});
```

See [before-after-hook](https://github.com/gr2m/before-after-hook#readme) for more documentation on hooks.

## Plugins

Octokit’s functionality can be extended using plugins. THe `Octokit.plugin()` method accepts a function or an array of functions and returns a new constructor.

A plugin is a function which gets two arguments:

1. the current instance
2. the Options passed to the constructor.

```js
// index.js
const MyOctokit = require("@octokit/core").plugin([
  require("./lib/my-plugin"),
  require("octokit-plugin-example")
]);

const octokit = new MyOctokit({ greeting: "Moin moin" });
octokit.helloWorld(); // logs "Moin moin, world!"
octokit.request("GET /"); // logs "GET / - 200 in 123ms"

// lib/my-plugin.js
module.exports = (octokit, options = { greeting: "Hello" }) => {
  // add a custom method
  octokit.helloWorld = () => console.log(`${options.greeting}, world!`);

  // hook into the request lifecycle
  octokit.hook.wrap("request", async (request, options) => {
    const time = Date.now();
    const response = await request(options);
    console.log(
      `${options.method} ${options.url} – ${response.status} in ${Date.now() -
        time}ms`
    );
    return response;
  });
};
```

## LICENSE

[MIT](LICENSE)
