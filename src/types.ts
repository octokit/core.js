import type * as OctokitTypes from "@octokit/types";
import type { RequestError } from "@octokit/request-error";

import type { Octokit } from "./index.js";

export type RequestParameters = OctokitTypes.RequestParameters;

export interface OctokitOptions {
  // TODO: add types for authStrategy & auth options and octokit.auth() method,
  //       see https://tinyurl.com/typescript-auth-strategies
  authStrategy?: any;
  auth?: any;
  userAgent?: string;
  previews?: string[];
  baseUrl?: string;
  log?: {
    debug: (message: string) => unknown;
    info: (message: string) => unknown;
    warn: (message: string) => unknown;
    error: (message: string) => unknown;
  };
  request?: OctokitTypes.RequestRequestOptions;
  timeZone?: string;
  [option: string]: any;
}

export type Constructor<T> = new (...args: any[]) => T;

export type ReturnTypeOf<T extends AnyFunction | AnyFunction[]> =
  T extends AnyFunction
    ? ReturnType<T>
    : T extends AnyFunction[]
      ? // exclude `void` from intersection, see octokit/octokit.js#2115
        UnionToIntersection<Exclude<ReturnType<T[number]>, void>>
      : never;

/**
 * @author https://stackoverflow.com/users/2887218/jcalz
 * @see https://stackoverflow.com/a/50375286/10325032
 */
export type UnionToIntersection<Union> = (
  Union extends any ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void // tslint:disable-line: no-unused
  ? Intersection
  : never;

type AnyFunction = (...args: any) => any;

export type OctokitPlugin = (
  octokit: Octokit,
  options: OctokitOptions,
) => { [key: string]: any } | void;

export type Hooks = {
  request: {
    Options: Required<OctokitTypes.EndpointDefaults>;
    Result: OctokitTypes.OctokitResponse<any>;
    Error: RequestError | Error;
  };
  [key: string]: {
    Options: unknown;
    Result: unknown;
    Error: unknown;
  };
};
