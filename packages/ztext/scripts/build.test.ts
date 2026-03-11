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
