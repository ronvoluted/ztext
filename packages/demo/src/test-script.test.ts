import { describe, expect, test } from "bun:test";
import { resolve } from "path";

const demoRoot = resolve(import.meta.dir, "..");

describe("demo test script", () => {
	test("package.json has a test script", async () => {
		const pkg = await Bun.file(resolve(demoRoot, "package.json")).json();
		expect(pkg.scripts.test).toBeDefined();
	});

	test("test script builds before running tests", async () => {
		const pkg = await Bun.file(resolve(demoRoot, "package.json")).json();
		expect(pkg.scripts.test).toContain("build");
		expect(pkg.scripts.test).toMatch(/build.*&&.*bun test/);
	});

	test("test script uses bun test", async () => {
		const pkg = await Bun.file(resolve(demoRoot, "package.json")).json();
		expect(pkg.scripts.test).toContain("bun test");
	});

	test("root package.json delegates test to workspaces", async () => {
		const rootPkg = await Bun.file(
			resolve(demoRoot, "../../package.json"),
		).json();
		expect(rootPkg.scripts.test).toContain("--filter");
		expect(rootPkg.scripts.test).toContain("test");
	});

	test("demo is included in root workspaces", async () => {
		const rootPkg = await Bun.file(
			resolve(demoRoot, "../../package.json"),
		).json();
		expect(rootPkg.workspaces).toContain("packages/*");
	});

	test("test files exist in src directory", async () => {
		const glob = new Bun.Glob("*.test.ts");
		const testFiles: string[] = [];
		for await (const file of glob.scan(resolve(demoRoot, "src"))) {
			testFiles.push(file);
		}
		expect(testFiles.length).toBeGreaterThan(0);
		expect(testFiles).toContain("smoke.test.ts");
	});
});
