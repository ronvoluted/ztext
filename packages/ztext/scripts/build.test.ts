import { describe, expect, test, beforeAll } from "bun:test";
import { join } from "path";
import { $ } from "bun";

const pkgDir = join(import.meta.dir, "..");
const distDir = join(pkgDir, "dist");

beforeAll(async () => {
	await $`bun run build`.cwd(pkgDir);
});

describe("build output", () => {
	test("dist/ztext.js exists", async () => {
		const file = Bun.file(join(distDir, "ztext.js"));
		expect(await file.exists()).toBe(true);
	});

	test("dist/ztext.js is valid ESM (contains export)", async () => {
		const content = await Bun.file(join(distDir, "ztext.js")).text();
		expect(content).toContain("export");
	});

	test("dist/ztext.js is under 20kb", async () => {
		const file = Bun.file(join(distDir, "ztext.js"));
		expect(file.size).toBeLessThan(20_000);
	});

	test("dist/ztext.js has sourcemap reference", async () => {
		const content = await Bun.file(join(distDir, "ztext.js")).text();
		expect(content).toContain("//# sourceMappingURL=ztext.js.map");
	});

	test("dist/ztext.js.map exists", async () => {
		const file = Bun.file(join(distDir, "ztext.js.map"));
		expect(await file.exists()).toBe(true);
	});

	test("dist/index.d.ts exists", async () => {
		const file = Bun.file(join(distDir, "index.d.ts"));
		expect(await file.exists()).toBe(true);
	});

	test("dist/index.d.ts exports ZtextOptions interface", async () => {
		const content = await Bun.file(join(distDir, "index.d.ts")).text();
		expect(content).toContain("export interface ZtextOptions");
	});

	test("dist/index.d.ts exports Ztextify class", async () => {
		const content = await Bun.file(join(distDir, "index.d.ts")).text();
		expect(content).toContain("export declare class Ztextify");
	});

	test("dist/index.d.ts exports default init function", async () => {
		const content = await Bun.file(join(distDir, "index.d.ts")).text();
		expect(content).toContain("export default init");
	});
});

describe("build output - runtime", () => {
	test("built module exports init, Ztextify, and default", async () => {
		const mod = await import(join(distDir, "ztext.js"));
		expect(typeof mod.init).toBe("function");
		expect(typeof mod.Ztextify).toBe("function");
		expect(typeof mod.default).toBe("function");
		expect(mod.default).toBe(mod.init);
	});

	test("built module has no unexpected exports", async () => {
		const mod = await import(join(distDir, "ztext.js"));
		const keys = Object.keys(mod).sort();
		expect(keys).toEqual(["Ztextify", "default", "init"]);
	});
});

describe("build output - sourcemap", () => {
	test("sourcemap is valid JSON with expected structure", async () => {
		const raw = await Bun.file(join(distDir, "ztext.js.map")).text();
		const map = JSON.parse(raw);
		expect(map.version).toBe(3);
		expect(Array.isArray(map.sources)).toBe(true);
		expect(typeof map.mappings).toBe("string");
		expect(map.mappings.length).toBeGreaterThan(0);
	});

	test("sourcemap references the original source file", async () => {
		const raw = await Bun.file(join(distDir, "ztext.js.map")).text();
		const map = JSON.parse(raw);
		const hasSource = map.sources.some((s: string) => s.includes("index.ts"));
		expect(hasSource).toBe(true);
	});
});

describe("build output - bundle quality", () => {
	test("bundle includes license banner", async () => {
		const content = await Bun.file(join(distDir, "ztext.js")).text();
		expect(content).toStartWith("/*!");
		expect(content).toContain("ztext.js");
		expect(content).toContain("Licensed MIT");
	});

	test("bundle is minified (single line of code)", async () => {
		const content = await Bun.file(join(distDir, "ztext.js")).text();
		const lines = content.split("\n").filter((l) => l.trim().length > 0);
		// Banner comment lines + 1 code line + debugId + sourcemap ref
		expect(lines.length).toBeLessThanOrEqual(8);
	});

	test("bundle has no unminified function/var keywords with whitespace", async () => {
		const content = await Bun.file(join(distDir, "ztext.js")).text();
		// In minified code, "function " still appears but indented blocks should not
		expect(content).not.toContain("\t\t");
	});
});

describe("build output - package.json alignment", () => {
	test("package.json main field points to existing file", async () => {
		const pkg = await Bun.file(join(pkgDir, "package.json")).json();
		const mainPath = join(pkgDir, pkg.main);
		expect(await Bun.file(mainPath).exists()).toBe(true);
	});

	test("package.json types field points to existing file", async () => {
		const pkg = await Bun.file(join(pkgDir, "package.json")).json();
		const typesPath = join(pkgDir, pkg.types);
		expect(await Bun.file(typesPath).exists()).toBe(true);
	});

	test("declaration file declares init function", async () => {
		const content = await Bun.file(join(distDir, "index.d.ts")).text();
		expect(content).toContain("export declare function init(): void");
	});

	test("declaration file has all ZtextOptions properties", async () => {
		const content = await Bun.file(join(distDir, "index.d.ts")).text();
		const expectedProps = [
			"depth",
			"direction",
			"event",
			"eventRotation",
			"eventDirection",
			"fade",
			"layers",
			"perspective",
			"zEngaged",
		];
		for (const prop of expectedProps) {
			expect(content).toContain(`${prop}?:`);
		}
	});
});
