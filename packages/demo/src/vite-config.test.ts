import { describe, expect, test } from "bun:test";
import { existsSync } from "fs";
import { resolve } from "path";

const demoRoot = resolve(import.meta.dir, "..");
const ztextRoot = resolve(demoRoot, "../ztext");

describe("vite.config.ts", () => {
	test("vite.config.ts exists", () => {
		expect(existsSync(resolve(demoRoot, "vite.config.ts"))).toBe(true);
	});

	test("config resolves ztext alias to workspace source", async () => {
		const configText = await Bun.file(
			resolve(demoRoot, "vite.config.ts"),
		).text();
		expect(configText).toContain("resolve");
		expect(configText).toContain("alias");
		expect(configText).toContain("ztext");
		expect(configText).toContain("../ztext/src/index.ts");
	});

	test("config allows filesystem access to ztext package", async () => {
		const configText = await Bun.file(
			resolve(demoRoot, "vite.config.ts"),
		).text();
		expect(configText).toContain("server");
		expect(configText).toContain("fs");
		expect(configText).toContain("allow");
		expect(configText).toContain("../ztext");
	});

	test("ztext source file exists at aliased path", () => {
		expect(existsSync(resolve(ztextRoot, "src/index.ts"))).toBe(true);
	});

	test("config uses sveltekit plugin", async () => {
		const configText = await Bun.file(
			resolve(demoRoot, "vite.config.ts"),
		).text();
		expect(configText).toContain("sveltekit()");
		expect(configText).toContain("@sveltejs/kit/vite");
	});

	test("config uses defineConfig from vite", async () => {
		const configText = await Bun.file(
			resolve(demoRoot, "vite.config.ts"),
		).text();
		expect(configText).toContain('from "vite"');
		expect(configText).toContain("defineConfig");
	});
});
