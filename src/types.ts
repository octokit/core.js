import * as OctokitTypes from "@octokit/types";

import { Octokit } from ".";

export type RequestParameters = OctokitTypes.RequestParameters;

export type OctokitOptions = {
  auth?: string | OctokitTypes.AuthInterface;
  request?: OctokitTypes.RequestRequestOptions;
  timeZone?: string;
  [option: string]: any;
};

export type Plugin = (octokit: Octokit, options: OctokitOptions) => void;
