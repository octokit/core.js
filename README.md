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

If you need a minimalistic library to utilize GitHub's [REST API](https://developer.github.com/v3/) and [GraphQL API](https://developer.github.com/v4/) which you can extend with plugins as needed, than `@octokit/core` is a great starting point.

If you don't need the Plugin API then using [`@octokit/request`](https://github.com/octokit/request.js/) or [`@octokit/graphql`](https://github.com/octokit/graphql.js/) directly is a good alternative.

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

You can set `options.auth` to a token, which will be used to correctly set the `Authorization` header for the requests you do with `octokit.request()` and `octokit.graphql()`. Example

```js
import { Octokit } from "@octokit/core";

const octokit = new Octokit({
  auth: "mypersonalaccesstoken123"
});

octokit.request("/user").then(response => console.log(response.data));
```

All other authentication strategies are supported using [`@octokit/auth`](@octokit/auth-app.js#readme), just pass the `auth()` method returned by any of the strategies as `options.auth`. Example

```js
import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";

const octokit = new Octokit({
  auth: createAppAuth({
    id: 123,
    privateKey: process.env.PRIVATE_KEY
  )}
})

octokit.request('/app').then(response => console.log(response.data))
```

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
