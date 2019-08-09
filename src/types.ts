import { Octokit } from ".";

export type OctokitOptions = {
  [option: string]: any;
};

export type Plugin = (octokit: Octokit, options?: OctokitOptions) => void;
