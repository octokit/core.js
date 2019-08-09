import { OctokitOptions, Plugin } from "./types";

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

  constructor(options?: OctokitOptions) {
    // https://stackoverflow.com/a/16345172
    const classConstructor = this.constructor as typeof Octokit;
    classConstructor.plugins.forEach(plugin => plugin(this, options));
  }

  // allow for plugins to extend the Octokit instance
  [key: string]: any;
}
