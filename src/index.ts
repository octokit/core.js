import { getUserAgent } from "universal-user-agent";
import { Collection, HookCollection } from "before-after-hook";
import { request } from "@octokit/request";
import { graphql, withCustomRequest } from "@octokit/graphql";

import { OctokitOptions, Parameters, Plugin } from "./types";
import { VERSION } from "./version";
import { withAuthorizationPrefix } from "./auth";

export class Octokit {
  static defaults(defaults: OctokitOptions) {
    return class OctokitWithDefaults extends this {
      static defaults(newDefaults: OctokitOptions): typeof Octokit {
        return Octokit.defaults(Object.assign({}, defaults, newDefaults));
      }

      constructor(options: OctokitOptions = {}) {
        super(Object.assign({}, defaults, options));
      }
    };
  }

  static plugins: Plugin[] = [];
  static plugin(plugins: Plugin | Plugin[]) {
    const currentPlugins = this.plugins;
    const newPlugins = Array.isArray(plugins) ? plugins : [plugins];

    return class NewOctokit extends this {
      static plugins = currentPlugins.concat(
        newPlugins.filter(plugin => !currentPlugins.includes(plugin))
      );
    };
  }

  constructor(options: OctokitOptions = {}) {
    const hook = new Collection();
    const requestDefaults: Required<Parameters> = {
      baseUrl: request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    };

    // prepend default user agent with `options.userAgent` if set
    requestDefaults.headers["user-agent"] = [
      options.userAgent,
      `octokit-core.js/${VERSION} ${getUserAgent()}`
    ]
      .filter(Boolean)
      .join(" ");

    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }

    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }

    if (options.auth) {
      if (typeof options.auth === "string") {
        requestDefaults.headers.authorization = withAuthorizationPrefix(
          options.auth
        );
      } else {
        // @ts-ignore
        hook.wrap("request", options.auth.hook);
      }
    }

    this.request = request.defaults(requestDefaults);
    this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign(
      {
        debug: () => {},
        info: () => {},
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      },
      options.log
    );
    this.hook = hook;

    // apply plugins
    // https://stackoverflow.com/a/16345172
    const classConstructor = this.constructor as typeof Octokit;
    classConstructor.plugins.forEach(plugin => plugin(this, options));
  }

  // assigned during constructor
  request: typeof request;
  graphql: typeof graphql;
  log: {
    debug: (message: string, additionalInfo?: object) => any;
    info: (message: string, additionalInfo?: object) => any;
    warn: (message: string, additionalInfo?: object) => any;
    error: (message: string, additionalInfo?: object) => any;
    [key: string]: any;
  };
  hook: HookCollection;

  // allow for plugins to extend the Octokit instance
  [key: string]: any;
}
