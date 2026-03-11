import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dir;
const ztextDist = resolve(root, "packages/ztext/dist");
const demoBuild = resolve(root, "packages/demo/build");
const demoBuildHtml = () =>
	Bun.file(resolve(demoBuild, "index.html")).text();

describe("end-to-end verification", () => {
	describe("bun install", () => {
		it("node_modules exists at root", () => {
			expect(existsSync(resolve(root, "node_modules"))).toBe(true);
		});

		it("ztext workspace is linked", () => {
			expect(existsSync(resolve(root, "node_modules/ztext"))).toBe(true);
		});

		it("demo workspace resolves ztext dependency", async () => {
			const pkg = await Bun.file(
				resolve(root, "packages/demo/package.json"),
			).json();
			expect(pkg.dependencies.ztext).toBe("workspace:*");
		});
	});

	describe("ztext library build", () => {
		it("dist/ztext.js exists", () => {
			expect(existsSync(resolve(ztextDist, "ztext.js"))).toBe(true);
		});

		it("dist/index.d.ts exists", () => {
			expect(existsSync(resolve(ztextDist, "index.d.ts"))).toBe(true);
		});

		it("dist/ztext.js.map exists", () => {
			expect(existsSync(resolve(ztextDist, "ztext.js.map"))).toBe(true);
		});

		it("dist/ztext.js is valid ESM", async () => {
			const content = await Bun.file(resolve(ztextDist, "ztext.js")).text();
			expect(content).toContain("export");
		});

		it("dist/ztext.js is reasonably sized (< 20kb)", async () => {
			const file = Bun.file(resolve(ztextDist, "ztext.js"));
			expect(file.size).toBeLessThan(20_000);
		});

		it("dist/ztext.js contains license banner", async () => {
			const content = await Bun.file(resolve(ztextDist, "ztext.js")).text();
			expect(content).toContain("ztext.js v1.0.1");
			expect(content).toContain("Licensed MIT");
		});

		it("exports Ztextify, init, and default", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			expect(mod.Ztextify).toBeDefined();
			expect(mod.init).toBeDefined();
			expect(mod.default).toBeDefined();
		});

		it("Ztextify is a constructor function", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			expect(typeof mod.Ztextify).toBe("function");
		});

		it("init is the default export", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			expect(mod.default).toBe(mod.init);
		});

		it("type declarations export ZtextOptions interface", async () => {
			const dts = await Bun.file(resolve(ztextDist, "index.d.ts")).text();
			expect(dts).toContain("ZtextOptions");
			expect(dts).toContain("Ztextify");
			expect(dts).toContain("init");
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

		it("_app contains immutable assets directory", () => {
			expect(
				existsSync(resolve(demoBuild, "_app/immutable")),
			).toBe(true);
		});

		it("bundled CSS files exist", () => {
			const assetsDir = resolve(demoBuild, "_app/immutable/assets");
			expect(existsSync(assetsDir)).toBe(true);
			const cssFiles = readdirSync(assetsDir).filter((f) =>
				f.endsWith(".css"),
			);
			expect(cssFiles.length).toBeGreaterThan(0);
		});

		it("bundled JS chunks exist", () => {
			const chunksDir = resolve(demoBuild, "_app/immutable/chunks");
			expect(existsSync(chunksDir)).toBe(true);
			const jsFiles = readdirSync(chunksDir).filter((f) =>
				f.endsWith(".js"),
			);
			expect(jsFiles.length).toBeGreaterThan(0);
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

		it("root package.json has dev script", async () => {
			const pkg = await Bun.file(resolve(root, "package.json")).json();
			expect(pkg.scripts.dev).toBeDefined();
		});

		it("ztext package has build and test scripts", async () => {
			const pkg = await Bun.file(
				resolve(root, "packages/ztext/package.json"),
			).json();
			expect(pkg.scripts.build).toBeDefined();
			expect(pkg.scripts.test).toBeDefined();
		});

		it("demo package has build and test scripts", async () => {
			const pkg = await Bun.file(
				resolve(root, "packages/demo/package.json"),
			).json();
			expect(pkg.scripts.build).toBeDefined();
			expect(pkg.scripts.test).toBeDefined();
		});
	});

	describe("monorepo structure", () => {
		it("uses bun workspaces", async () => {
			const pkg = await Bun.file(resolve(root, "package.json")).json();
			expect(pkg.workspaces).toEqual(["packages/*"]);
		});

		it("root is private", async () => {
			const pkg = await Bun.file(resolve(root, "package.json")).json();
			expect(pkg.private).toBe(true);
		});

		it("ztext package is ESM", async () => {
			const pkg = await Bun.file(
				resolve(root, "packages/ztext/package.json"),
			).json();
			expect(pkg.type).toBe("module");
		});

		it("ztext has no runtime dependencies", async () => {
			const pkg = await Bun.file(
				resolve(root, "packages/ztext/package.json"),
			).json();
			expect(pkg.dependencies).toBeUndefined();
		});

		it("demo uses static adapter", async () => {
			const config = await Bun.file(
				resolve(root, "packages/demo/svelte.config.js"),
			).text();
			expect(config).toContain("adapter-static");
		});
	});

	describe("cross-workspace integration", () => {
		it("demo vite config aliases ztext to workspace source", async () => {
			const config = await Bun.file(
				resolve(root, "packages/demo/vite.config.ts"),
			).text();
			expect(config).toContain("ztext");
			expect(config).toContain("../ztext/src/index.ts");
		});

		it("demo build bundles ztext library code", () => {
			const dirs = [
				resolve(demoBuild, "_app/immutable/nodes"),
				resolve(demoBuild, "_app/immutable/chunks"),
			];
			let allJs = "";
			for (const dir of dirs) {
				if (!existsSync(dir)) continue;
				for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
					allJs += readFileSync(resolve(dir, f), "utf-8") + "\n";
				}
			}
			// ztext creates z-text and z-layers spans — these strings should appear in bundled output
			expect(allJs).toContain("z-text");
			expect(allJs).toContain("z-layer");
		});

		it("demo pre-rendered HTML contains data-z attributes from ztext", async () => {
			const html = await demoBuildHtml();
			expect(html).toContain("data-z");
		});
	});

	describe("build artifact integrity", () => {
		it("sourcemap is valid JSON", async () => {
			const map = await Bun.file(
				resolve(ztextDist, "ztext.js.map"),
			).json();
			expect(map.version).toBe(3);
			expect(map.sources).toBeDefined();
			expect(Array.isArray(map.sources)).toBe(true);
			expect(map.mappings).toBeDefined();
		});

		it("sourcemap references original source file", async () => {
			const map = await Bun.file(
				resolve(ztextDist, "ztext.js.map"),
			).json();
			const hasSource = map.sources.some((s: string) =>
				s.includes("index.ts"),
			);
			expect(hasSource).toBe(true);
		});

		it("built JS is minified (few newlines relative to size)", async () => {
			const content = await Bun.file(
				resolve(ztextDist, "ztext.js"),
			).text();
			const lines = content.split("\n");
			// Banner takes ~4 lines, code should be 1-2 lines when minified
			expect(lines.length).toBeLessThan(10);
		});

		it("type declarations have proper export syntax", async () => {
			const dts = await Bun.file(
				resolve(ztextDist, "index.d.ts"),
			).text();
			expect(dts).toContain("export");
			expect(dts).toContain("interface ZtextOptions");
			expect(dts).toContain("class Ztextify");
		});

		it("all demo CSS assets are non-empty", () => {
			const assetsDir = resolve(demoBuild, "_app/immutable/assets");
			const cssFiles = readdirSync(assetsDir).filter((f) =>
				f.endsWith(".css"),
			);
			for (const f of cssFiles) {
				const stat = statSync(resolve(assetsDir, f));
				expect(stat.size).toBeGreaterThan(0);
			}
		});

		it("all demo JS chunks are non-empty", () => {
			const chunksDir = resolve(demoBuild, "_app/immutable/chunks");
			const jsFiles = readdirSync(chunksDir).filter((f) =>
				f.endsWith(".js"),
			);
			for (const f of jsFiles) {
				const stat = statSync(resolve(chunksDir, f));
				expect(stat.size).toBeGreaterThan(0);
			}
		});
	});

	describe("runtime module verification", () => {
		it("Ztextify has a destroy method on prototype", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			expect(typeof mod.Ztextify.prototype.destroy).toBe("function");
		});

		it("module has exactly three named exports", async () => {
			const mod = await import(resolve(ztextDist, "ztext.js"));
			const keys = Object.keys(mod).sort();
			expect(keys).toEqual(["Ztextify", "default", "init"]);
		});
	});

	describe("demo content verification", () => {
		it("pre-rendered HTML has all page sections", async () => {
			const html = await demoBuildHtml();
			expect(html).toContain('id="header"');
			expect(html).toContain('id="download"');
			expect(html).toContain('id="initialization"');
			expect(html).toContain('id="styling"');
			expect(html).toContain('id="options"');
		});

		it("pre-rendered HTML has header letters for z-t-e-x-t-.-j-s", async () => {
			const html = await demoBuildHtml();
			for (const letter of ["z", "t", "e", "x", "t", ".", "j", "s"]) {
				expect(html).toContain(`<span data-z="">${letter}</span>`);
			}
		});

		it("pre-rendered HTML has option demo sections", async () => {
			const html = await demoBuildHtml();
			const options = [
				"depth",
				"layers",
				"perspective",
				"fade",
				"direction",
				"event",
				"eventRotation",
				"eventDirection",
			];
			for (const opt of options) {
				expect(html).toContain(opt);
			}
		});

		it("pre-rendered HTML has footer with copyright", async () => {
			const html = await demoBuildHtml();
			expect(html).toContain("footer");
			expect(html).toContain("©");
		});

		it("all modulepreload assets exist on disk", async () => {
			const html = await demoBuildHtml();
			const hrefs: string[] = [];
			const re = /href="([^"]+)"[^>]*rel="modulepreload"|rel="modulepreload"[^>]*href="([^"]+)"/g;
			let match;
			while ((match = re.exec(html)) !== null) {
				hrefs.push(match[1] || match[2]);
			}
			expect(hrefs.length).toBeGreaterThan(0);
			for (const href of hrefs) {
				const filePath = resolve(demoBuild, href.replace(/^\.\//, ""));
				expect(existsSync(filePath)).toBe(true);
			}
		});

		it("all local stylesheet assets exist on disk", async () => {
			const html = await demoBuildHtml();
			const hrefs: string[] = [];
			const re = /href="([^"]+)"[^>]*rel="stylesheet"|rel="stylesheet"[^>]*href="([^"]+)"/g;
			let match;
			while ((match = re.exec(html)) !== null) {
				const href = match[1] || match[2];
				if (!href.startsWith("http")) hrefs.push(href);
			}
			expect(hrefs.length).toBeGreaterThan(0);
			for (const href of hrefs) {
				const filePath = resolve(demoBuild, href.replace(/^\.\//, ""));
				expect(existsSync(filePath)).toBe(true);
			}
		});
	});
});
