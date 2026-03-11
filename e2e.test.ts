import { describe, expect, it, beforeAll } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dir;
const ztextDist = resolve(root, "packages/ztext/dist");
const demoBuild = resolve(root, "packages/demo/build");

describe("end-to-end verification", () => {
	describe("bun install", () => {
		it("node_modules exists at root", () => {
			expect(existsSync(resolve(root, "node_modules"))).toBe(true);
		});

		it("ztext workspace is linked", () => {
			expect(existsSync(resolve(root, "node_modules/ztext"))).toBe(true);
		});
	});

	describe("ztext library build", () => {
		it("dist/ztext.js exists", () => {
			expect(existsSync(resolve(ztextDist, "ztext.js"))).toBe(true);
		});

		it("dist/index.d.ts exists", () => {
			expect(existsSync(resolve(ztextDist, "index.d.ts"))).toBe(true);
		});

		it("dist/ztext.js is valid ESM", async () => {
			const content = await Bun.file(resolve(ztextDist, "ztext.js")).text();
			expect(content).toContain("export");
		});

		it("dist/ztext.js is reasonably sized (< 20kb)", async () => {
			const file = Bun.file(resolve(ztextDist, "ztext.js"));
			expect(file.size).toBeLessThan(20_000);
		});

		it("exports Ztextify, init, and default", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			expect(mod.Ztextify).toBeDefined();
			expect(mod.init).toBeDefined();
			expect(mod.default).toBeDefined();
		});
	});

	describe("demo static build", () => {
		it("build directory exists", () => {
			expect(existsSync(demoBuild)).toBe(true);
		});

		it("index.html exists", () => {
			expect(existsSync(resolve(demoBuild, "index.html"))).toBe(true);
		});

		it("index.html is valid HTML with doctype", async () => {
			const html = await Bun.file(resolve(demoBuild, "index.html")).text();
			expect(html).toStartWith("<!doctype html>");
		});

		it("index.html contains page title", async () => {
			const html = await Bun.file(resolve(demoBuild, "index.html")).text();
			expect(html).toContain("ztext.js");
		});

		it("index.html contains meta description", async () => {
			const html = await Bun.file(resolve(demoBuild, "index.html")).text();
			expect(html).toContain('name="description"');
		});

		it("index.html references CSS assets", async () => {
			const html = await Bun.file(resolve(demoBuild, "index.html")).text();
			expect(html).toContain('rel="stylesheet"');
		});

		it("index.html references JS modules", async () => {
			const html = await Bun.file(resolve(demoBuild, "index.html")).text();
			expect(html).toContain('rel="modulepreload"');
		});

		it("_app directory exists with bundled assets", () => {
			expect(existsSync(resolve(demoBuild, "_app"))).toBe(true);
		});
	});

	describe("workspace scripts", () => {
		it("root package.json delegates build to workspaces", async () => {
			const pkg = await Bun.file(resolve(root, "package.json")).json();
			expect(pkg.scripts.build).toContain("--filter");
		});

		it("root package.json delegates test to workspaces", async () => {
			const pkg = await Bun.file(resolve(root, "package.json")).json();
			expect(pkg.scripts.test).toContain("--filter");
		});

		it("ztext package has build and test scripts", async () => {
			const pkg = await Bun.file(resolve(root, "packages/ztext/package.json")).json();
			expect(pkg.scripts.build).toBeDefined();
			expect(pkg.scripts.test).toBeDefined();
		});

		it("demo package has build and test scripts", async () => {
			const pkg = await Bun.file(resolve(root, "packages/demo/package.json")).json();
			expect(pkg.scripts.build).toBeDefined();
			expect(pkg.scripts.test).toBeDefined();
		});
	});
});
