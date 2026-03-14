import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const css = readFileSync(join(import.meta.dir, "app.css"), "utf-8");

describe("app.css structure", () => {
	test("contains CSS reset", () => {
		expect(css).toContain("box-sizing: border-box");
		expect(css).toContain("margin: 0");
		expect(css).toContain("text-rendering: optimizeLegibility");
		expect(css).toContain("scroll-behavior: smooth");
	});

	test("contains CSS custom properties for colors", () => {
		expect(css).toContain("--color-red:");
		expect(css).toContain("--color-blue:");
		expect(css).toContain("--color-amber:");
		expect(css).toContain("--color-teal:");
		expect(css).toContain("--color-indigo:");
		expect(css).toContain("--color-blue-gray:");
	});

	test("contains code theme variables (light and dark)", () => {
		expect(css).toContain("--code-black-light:");
		expect(css).toContain("--code-white-light:");
		expect(css).toContain("--code-black-dark:");
		expect(css).toContain("--code-white-dark:");
	});

	test("contains layout variables", () => {
		expect(css).toContain("--radius:");
		expect(css).toContain("--transition:");
		expect(css).toContain("--degrees:");
	});

	test("uses var() references instead of SCSS variables", () => {
		expect(css).not.toContain("$");
		expect(css).toContain("var(--");
	});

	test("does not contain SCSS syntax", () => {
		expect(css).not.toContain("@import");
		expect(css).not.toContain("@include");
		expect(css).not.toContain("@mixin");
		expect(css).not.toContain("@extend");
		expect(css).not.toContain("@function");
		expect(css).not.toContain("@return");
	});
});

describe("app.css utility classes", () => {
	test("has .no-select class", () => {
		expect(css).toContain(".no-select");
		expect(css).toContain("user-select: none");
	});

	test("has .no-drag class", () => {
		expect(css).toContain(".no-drag");
	});

	test("has .no-tap class", () => {
		expect(css).toContain(".no-tap");
		expect(css).toContain("-webkit-tap-highlight-color");
	});
});

describe("app.css animations", () => {
	test("contains wobble keyframes", () => {
		expect(css).toContain("@keyframes wobble");
		expect(css).toContain("rotate3d");
	});

	test("contains copier keyframes", () => {
		expect(css).toContain("@keyframes copier");
	});
});

describe("app.css layout", () => {
	test("has structural classes", () => {
		expect(css).toContain(".container");
		expect(css).toContain(".wrapper");
		expect(css).toContain(".split");
		expect(css).toContain(".split-item");
	});

	test("has responsive breakpoints", () => {
		expect(css).toContain("@media (min-width: 35em)");
		expect(css).toContain("@media (min-width: 60em)");
	});
});

describe("app.css sections", () => {
	test("has header styles", () => {
		expect(css).toContain(".header");
		expect(css).toContain(".header h1");
	});

	test("has preview styles", () => {
		expect(css).toContain(".preview");
	});

	test("has options styles", () => {
		expect(css).toContain(".options");
		expect(css).toContain(".depth-option");
		expect(css).toContain(".layers-option");
		expect(css).toContain(".perspective-option");
		expect(css).toContain(".fade-option");
		expect(css).toContain(".direction-option");
		expect(css).toContain(".event-option");
		expect(css).toContain(".event-rotation-option");
		expect(css).toContain(".event-direction-option");
	});

	test("has more section styles", () => {
		expect(css).toContain(".more");
		expect(css).toContain(".toggle");
		expect(css).toContain(".svg-code-example");
		expect(css).toContain(".img-code-example");
		expect(css).toContain(".emoji-code-example");
	});

	test("has download section styles", () => {
		expect(css).toContain(".download");
	});

	test("has initialization section styles", () => {
		expect(css).toContain(".initialization");
		expect(css).toContain(".html-init");
	});

	test("has styling example styles", () => {
		expect(css).toContain(".styling-example-primary");
	});
});

describe("app.css uses color-mix() for shading", () => {
	test("uses color-mix() instead of SCSS shade()", () => {
		expect(css).toContain("color-mix(in srgb");
	});

	test("header letter colors use color-mix for z-layer shading", () => {
		expect(css).toContain(".header h1:nth-child(1) .z-layer:not(:first-child)");
		expect(css).toContain("color-mix(in srgb, var(--color-amber), black 25%)");
	});

	test("option variants use color-mix for z-layer shading", () => {
		expect(css).toContain(".depth-option .preview .z-layer:not(:first-child)");
		expect(css).toContain(".event-option .preview .z-layer:not(:first-child)");
	});
});

describe("app.css code themes", () => {
	test("has light code theme", () => {
		expect(css).toContain(".light .gray-code");
		expect(css).toContain(".light .red-code");
		expect(css).toContain(".light .blue-code");
	});

	test("has dark code theme", () => {
		expect(css).toContain(".dark .gray-code");
		expect(css).toContain(".dark .red-code");
		expect(css).toContain(".dark .blue-code");
	});
});

describe("app.css does not include dropped sections", () => {
	test("does not include GitHub card styles", () => {
		expect(css).not.toContain(".repo-box");
		expect(css).not.toContain(".repo-title");
		expect(css).not.toContain(".repo-stars");
	});

	test("does not include CodePen styles", () => {
		expect(css).not.toContain(".codepen-form");
		expect(css).not.toContain(".codepen-button");
	});

	test("does not include tip jar styles", () => {
		expect(css).not.toContain(".tip-jar");
		expect(css).not.toContain(".tip-button");
	});
});
