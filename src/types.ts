import * as OctokitTypes from "@octokit/types";

import { Octokit } from ".";

export type RequestParameters = OctokitTypes.RequestParameters;

export type OctokitOptions = {
  // TODO: add types for authStrategy & auth options and octokit.auth() method,
  //       see https://tinyurl.com/typescript-auth-strategies
  authStrategy?: any;
  auth?: any;
  request?: OctokitTypes.RequestRequestOptions;
  timeZone?: string;
  [option: string]: any;
};

export type Constructor<T> = new (...args: any[]) => T;

export type ReturnTypeOf<
  T extends AnyFunction | AnyFunction[]
> = T extends AnyFunction
  ? ReturnType<T>
  : T extends AnyFunction[]
  ? UnionToIntersection<ReturnType<T[number]>>
  : never;

/**
 * @author https://stackoverflow.com/users/2887218/jcalz
 * @see https://stackoverflow.com/a/50375286/10325032
 */
export type UnionToIntersection<Union> = (Union extends any
? (argument: Union) => void
: never) extends (argument: infer Intersection) => void // tslint:disable-line: no-unused
  ? Intersection
  : never;

type AnyFunction = (...args: any) => any;

export type OctokitPlugin = (
  octokit: Octokit,
  options: OctokitOptions
) => { [key: string]: any } | void;
