
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/activity" | "/contacts" | "/debrief" | "/finances" | "/maintenance" | "/petty-cash" | "/portals" | "/properties" | "/settings" | "/tasks" | "/tenants";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/activity": Record<string, never>;
			"/contacts": Record<string, never>;
			"/debrief": Record<string, never>;
			"/finances": Record<string, never>;
			"/maintenance": Record<string, never>;
			"/petty-cash": Record<string, never>;
			"/portals": Record<string, never>;
			"/properties": Record<string, never>;
			"/settings": Record<string, never>;
			"/tasks": Record<string, never>;
			"/tenants": Record<string, never>
		};
		Pathname(): "/" | "/activity" | "/contacts" | "/debrief" | "/finances" | "/maintenance" | "/petty-cash" | "/portals" | "/properties" | "/settings" | "/tasks" | "/tenants";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/manifest.json" | "/sw.js" | string & {};
	}
}