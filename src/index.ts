import getUserAgent from "universal-user-agent";
import { request } from "@octokit/request";

import { OctokitOptions, Parameters, Plugin } from "./types";
import { VERSION } from "./version";

export class Octokit {
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
    const requestDefaults: Required<Parameters> = {
      baseUrl: request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: options.request || {},
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

    this.request = request.defaults(requestDefaults);

    // apply plugins
    // https://stackoverflow.com/a/16345172
    const classConstructor = this.constructor as typeof Octokit;
    classConstructor.plugins.forEach(plugin => plugin(this, options));
  }

  // assigned during constructor
  request: typeof request;

  // allow for plugins to extend the Octokit instance
  [key: string]: any;
}
