// ************************************************************
// THIS CODE IS NOT EXECUTED. IT IS JUST FOR TYPECHECKING
// ************************************************************

import { Octokit } from "../src";

export function pluginsTest() {
  // `octokit` instance does not permit unknown keys
  const octokit = new Octokit();

  // @ts-expect-error Property 'unknown' does not exist on type 'Octokit'.(2339)
  octokit.unknown;

  const OctokitWithDefaults = Octokit.defaults({});
  const octokitWithDefaults = new OctokitWithDefaults();

  // Error: `octokitWithDefaults` does permit unknown keys
  // @ts-expect-error `.unknown` should not be typed as `any`
  octokitWithDefaults.unknown;

  const OctokitWithPlugin = Octokit.plugin(() => ({}));
  const octokitWithPlugin = new OctokitWithPlugin();

  // Error: `octokitWithPlugin` does permit unknown keys
  // @ts-expect-error `.unknown` should not be typed as `any`
  octokitWithPlugin.unknown;

  const OctokitWithPluginAndDefaults = Octokit.plugin(() => ({
    foo: 42,
  })).defaults({
    baz: "daz",
  });

  const octokitWithPluginAndDefaults = new OctokitWithPluginAndDefaults();

  octokitWithPluginAndDefaults.foo;
  // @ts-expect-error `.unknown` should not be typed as `any`
  octokitWithPluginAndDefaults.unknown;
}
