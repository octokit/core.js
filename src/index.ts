import { getUserAgent } from 'universal-user-agent';
import { Collection, HookCollection } from 'before-after-hook';
import { request } from '@octokit/request';
import { graphql, withCustomRequest } from '@octokit/graphql';
import { createTokenAuth } from '@octokit/auth-token';

import {
	Constructor,
	Hooks,
	OctokitOptions,
	OctokitPlugin,
	RequestParameters,
	ReturnTypeOf,
	UnionToIntersection,
} from './types';
import { VERSION } from './version';

export class Octokit {
	static VERSION = VERSION;
	static defaults<S extends Constructor<any>>(
		this: S,
		defaults: OctokitOptions | Function
	) {
		const OctokitWithDefaults = class extends this {
			constructor(...args: any[]) {
				const options = args[0] || {};

				if (typeof defaults === 'function') {
					super(defaults(options));
					return;
				}

				super(
					Object.assign(
						{},
						defaults,
						options,
						options.userAgent && defaults.userAgent
							? {
									userAgent: `${options.userAgent} ${defaults.userAgent}`,
							  }
							: null
					)
				);
			}
		};

		return OctokitWithDefaults as typeof this;
	}

	static plugins: OctokitPlugin[] = [];
	/**
	 * Attach a plugin (or many) to your Octokit instance.
	 *
	 * @example
	 * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
	 */
	static plugin<
		S extends Constructor<any> & { plugins: any[] },
		T extends OctokitPlugin[]
	>(this: S, ...newPlugins: T) {
		const currentPlugins = this.plugins;
		const NewOctokit = class extends this {
			static plugins = currentPlugins.concat(
				newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
			);
		};

		return NewOctokit as typeof this &
			Constructor<UnionToIntersection<ReturnTypeOf<T>>>;
	}

	constructor(options: OctokitOptions = {}) {
		const hook = new Collection<Hooks>();
		const requestDefaults: Required<RequestParameters> = {
			baseUrl: request.endpoint.DEFAULTS.baseUrl,
			headers: {},
			request: Object.assign({}, options.request, {
				// @ts-ignore internal usage only, no need to type
				hook: hook.bind(null, 'request'),
			}),
			mediaType: {
				previews: [],
				format: '',
			},
		};

		// prepend default user agent with `options.userAgent` if set
		requestDefaults.headers['user-agent'] = [
			options.userAgent,
			`octokit-core.js/${VERSION} ${getUserAgent()}`,
		]
			.filter(Boolean)
			.join(' ');

		if (options.baseUrl) {
			requestDefaults.baseUrl = options.baseUrl;
		}

		if (options.previews) {
			requestDefaults.mediaType.previews = options.previews;
		}

		if (options.timeZone) {
			requestDefaults.headers['time-zone'] = options.timeZone;
		}

		this.request = request.defaults(requestDefaults);
		this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
		this.log = Object.assign(
			{
				debug: () => {},
				info: () => {},
				warn: console.warn.bind(console),
				error: console.error.bind(console),
			},
			options.log
		);
		this.hook = hook;

		// (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
		//     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registered.
		// (2) If only `options.auth` is set, use the default token authentication strategy.
		// (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
		// TODO: type `options.auth` based on `options.authStrategy`.
		if (!options.authStrategy) {
			if (!options.auth) {
				// (1)
				this.auth = async () => ({
					type: 'unauthenticated',
				});
			} else {
				// (2)
				const auth = createTokenAuth(options.auth as string);
				// @ts-ignore  ¯\_(ツ)_/¯
				hook.wrap('request', auth.hook);
				this.auth = auth;
			}
		} else {
			const { authStrategy, ...otherOptions } = options;
			const auth = authStrategy(
				Object.assign(
					{
						request: this.request,
						log: this.log,
						// we pass the current octokit instance as well as its constructor options
						// to allow for authentication strategies that return a new octokit instance
						// that shares the same internal state as the current one. The original
						// requirement for this was the "event-octokit" authentication strategy
						// of https://github.com/probot/octokit-auth-probot.
						octokit: this,
						octokitOptions: otherOptions,
					},
					options.auth
				)
			);
			// @ts-ignore  ¯\_(ツ)_/¯
			hook.wrap('request', auth.hook);
			this.auth = auth;
		}

		// apply plugins
		// https://stackoverflow.com/a/16345172
		const classConstructor = this.constructor as typeof Octokit;
		classConstructor.plugins.forEach((plugin) => {
			Object.assign(this, plugin(this, options));
		});
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
	hook: HookCollection<Hooks>;

	// TODO: type `octokit.auth` based on passed options.authStrategy
	auth: (...args: unknown[]) => Promise<unknown>;
}

export const octokit = new Octokit();
export default octokit;
