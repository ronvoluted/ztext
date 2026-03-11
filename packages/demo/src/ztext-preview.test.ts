import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { scopeCSS } from "./lib/scope-css";

const componentPath = join(import.meta.dir, "lib", "ZtextPreview.svelte");
const component = readFileSync(componentPath, "utf-8");

describe("ZtextPreview.svelte", () => {
	test("file exists and is non-empty", () => {
		expect(component.length).toBeGreaterThan(0);
	});

	test("imports onMount from svelte", () => {
		expect(component).toContain('import { onMount } from "svelte"');
	});

	test("imports Ztextify from ztext", () => {
		expect(component).toContain('import { Ztextify } from "ztext"');
	});

	test("imports Example type", () => {
		expect(component).toContain("Example");
	});

	test("imports scopeCSS utility", () => {
		expect(component).toContain('import { scopeCSS } from "./scope-css"');
	});

	test("uses Svelte 5 $props() rune", () => {
		expect(component).toContain("$props()");
	});

	test("uses Svelte 5 $state() rune", () => {
		expect(component).toContain("$state()");
	});

	test("accepts example prop", () => {
		expect(component).toContain("example: Example");
	});

	test("has preview container with data-preview attribute", () => {
		expect(component).toContain("data-preview={example.selector}");
	});

	test("has ztext-preview-content div", () => {
		expect(component).toContain('class="ztext-preview-content"');
	});

	test("injects example HTML into content", () => {
		expect(component).toContain("content.innerHTML = example.html");
	});

	test("creates scoped style element", () => {
		expect(component).toContain('document.createElement("style")');
		expect(component).toContain("scopeCSS(example.css, scope)");
	});

	test("initializes data-z elements with Ztextify", () => {
		expect(component).toContain('querySelectorAll<HTMLElement>("[data-z]")');
		expect(component).toContain("new Ztextify(el,");
	});

	test("handles JS-constructor examples", () => {
		expect(component).toContain("if (example.js)");
		expect(component).toContain("Ztextify");
	});

	test("reads data attributes for options", () => {
		expect(component).toContain("el.dataset.zDepth");
		expect(component).toContain("el.dataset.zDirection");
		expect(component).toContain("el.dataset.zEvent");
		expect(component).toContain("el.dataset.zLayers");
		expect(component).toContain("el.dataset.zFade");
		expect(component).toContain("el.dataset.zPerspective");
	});

	test("has scoped CSS styles", () => {
		expect(component).toContain(".ztext-preview {");
		expect(component).toContain(".ztext-preview-content {");
	});

	test("does not use Svelte 4 slot syntax", () => {
		expect(component).not.toContain("<slot");
	});
});

describe("scopeCSS", () => {
	const scope = '[data-preview=".menu-0"]';

	test("scopes simple selectors", () => {
		const input = "h1 {\n\tcolor: red;\n}";
		const result = scopeCSS(input, scope);
		expect(result).toContain(`${scope} h1 {`);
	});

	test("scopes class selectors", () => {
		const input = ".z-text {\n\ttransform: none;\n}";
		const result = scopeCSS(input, scope);
		expect(result).toContain(`${scope} .z-text {`);
	});

	test("scopes attribute selectors", () => {
		const input = "[data-z]:hover .z-text {\n\ttransform: none;\n}";
		const result = scopeCSS(input, scope);
		expect(result).toContain(`${scope} [data-z]:hover .z-text {`);
	});

	test("preserves @keyframes rules unscoped", () => {
		const input = "@keyframes wobble {\n\t0% { transform: none; }\n}";
		const result = scopeCSS(input, scope);
		expect(result).toContain("@keyframes wobble {");
		expect(result).not.toContain(`${scope} @keyframes`);
	});

	test("scopes multiple selectors in one CSS block", () => {
		const input = "h1 {\n\tcolor: red;\n}\n\n.z-text {\n\ttransform: none;\n}";
		const result = scopeCSS(input, scope);
		expect(result).toContain(`${scope} h1 {`);
		expect(result).toContain(`${scope} .z-text {`);
	});

	test("handles CSS with @keyframes mixed with regular rules", () => {
		const input = `.z-text {
	animation: wobble 12s ease-in-out infinite;
}

@keyframes wobble {
	0% { transform: none; }
	100% { transform: none; }
}`;
		const result = scopeCSS(input, scope);
		expect(result).toContain(`${scope} .z-text {`);
		expect(result).toContain("@keyframes wobble {");
		expect(result).not.toContain(`${scope} @keyframes`);
	});
});
