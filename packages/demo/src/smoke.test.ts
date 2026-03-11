import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const buildDir = join(import.meta.dir, "..", "build");

describe("SvelteKit static build", () => {
	test("build directory exists", () => {
		expect(existsSync(buildDir)).toBe(true);
	});

	test("index.html exists", () => {
		expect(existsSync(join(buildDir, "index.html"))).toBe(true);
	});

	test("index.html contains 'ztext.js'", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain("ztext.js");
	});

	test("index.html has proper HTML structure", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain("<!doctype html>");
		expect(html).toContain("<html");
		expect(html).toContain("</html>");
	});

	test("index.html has meta description", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain('name="description"');
		expect(html).toContain("3D typography");
	});

	test("index.html has og tags", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain('property="og:title"');
		expect(html).toContain('property="og:description"');
	});

	test("static assets directory exists", () => {
		expect(existsSync(join(buildDir, "_app"))).toBe(true);
	});

	test("index.html references CSS", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain('rel="stylesheet"');
	});

	test("index.html references JS modules", () => {
		const html = readFileSync(join(buildDir, "index.html"), "utf-8");
		expect(html).toContain('rel="modulepreload"');
	});
});
