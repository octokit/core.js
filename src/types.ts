import * as OctokitTypes from "@octokit/types";

import { Octokit } from ".";

export type RequestParameters = OctokitTypes.RequestParameters;

export type OctokitOptions = {
  auth?: string | AutenticationHook;
  request?: OctokitTypes.RequestRequestOptions;
  timeZone?: string;
  [option: string]: any;
};

interface AutenticationHook {
  (options?: any): any;

  hook: (
    request: OctokitTypes.RequestInterface,
    options: OctokitTypes.EndpointOptions
  ) => ReturnType<OctokitTypes.RequestInterface>;
}

export type Plugin = (octokit: Octokit, options: OctokitOptions) => void;
