import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const layoutPath = join(import.meta.dir, "routes", "+layout.svelte");
const layout = readFileSync(layoutPath, "utf-8");

describe("+layout.svelte", () => {
	test("imports app.css", () => {
		expect(layout).toContain('import "../app.css"');
	});

	test("uses Svelte 5 $props() rune", () => {
		expect(layout).toContain("$props()");
	});

	test("renders children snippet", () => {
		expect(layout).toContain("{@render children()}");
	});

	test("sets page title", () => {
		expect(layout).toContain("<title>ztext.js");
	});

	test("has meta description", () => {
		expect(layout).toContain('name="description"');
		expect(layout).toContain("3D typography");
	});

	test("has Open Graph tags", () => {
		expect(layout).toContain('property="og:title"');
		expect(layout).toContain('property="og:description"');
	});

	test("loads Google Fonts with preconnect", () => {
		expect(layout).toContain('rel="preconnect"');
		expect(layout).toContain("fonts.googleapis.com");
		expect(layout).toContain("fonts.gstatic.com");
	});

	test("loads Nunito and Cousine font families", () => {
		expect(layout).toContain("family=Nunito");
		expect(layout).toContain("family=Cousine");
		expect(layout).toContain("wght@400;600;800");
	});

	test("uses display=swap for font loading", () => {
		expect(layout).toContain("display=swap");
	});

	test("does not use Svelte 4 slot syntax", () => {
		expect(layout).not.toContain("<slot");
	});
});
