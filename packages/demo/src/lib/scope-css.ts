/**
 * Scope CSS selectors by prepending a scope selector.
 * Leaves @keyframes rules unscoped.
 */
export function scopeCSS(css: string, scope: string): string {
	return css.replace(
		/^([a-zA-Z.#\[:@][^{]*)\{/gm,
		(match, selector: string) => {
			if (selector.trim().startsWith("@keyframes")) return match;
			return `${scope} ${selector.trim()} {`;
		},
	);
}
