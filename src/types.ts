import {
  EndpointOptions,
  RequestInterface,
  RequestRequestOptions
} from "@octokit/types";

import { Octokit } from ".";

export type OctokitOptions = {
  auth?: string | AutenticationHook;
  request?: RequestRequestOptions;
  timeZone?: string;
  [option: string]: any;
};

interface AutenticationHook {
  (options?: any): any;

  hook: (
    request: RequestInterface,
    options: EndpointOptions
  ) => ReturnType<RequestInterface>;
}

export type Plugin = (octokit: Octokit, options: OctokitOptions) => void;
