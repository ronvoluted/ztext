import { describe, expect, test } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";

const rootDir = import.meta.dir;
const pkg = await Bun.file(join(rootDir, "package.json")).json();

describe("root package.json", () => {
  test("has correct name", () => {
    expect(pkg.name).toBe("ztext-monorepo");
  });

  test("is private", () => {
    expect(pkg.private).toBe(true);
  });

  test("defines workspaces pointing to packages/*", () => {
    expect(pkg.workspaces).toEqual(["packages/*"]);
  });

  test("has build script delegating to workspaces", () => {
    expect(pkg.scripts.build).toBe("bun run --filter '*' build");
  });

  test("has test script delegating to workspaces", () => {
    expect(pkg.scripts.test).toBe("bun run --filter '*' test");
  });

  test("has dev script delegating to demo workspace", () => {
    expect(pkg.scripts.dev).toBe("bun run --filter demo dev");
  });

  test("packages directory exists", () => {
    expect(existsSync(join(rootDir, "packages"))).toBe(true);
  });

  test("does not have version field (monorepo root)", () => {
    expect(pkg.version).toBeUndefined();
  });

  test("does not have main field (monorepo root)", () => {
    expect(pkg.main).toBeUndefined();
  });
});
