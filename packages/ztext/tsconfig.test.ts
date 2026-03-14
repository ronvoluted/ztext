import { describe, expect, test } from "bun:test";
import { join } from "path";

const pkgDir = import.meta.dir;
const tsconfig = await Bun.file(join(pkgDir, "tsconfig.json")).json();

describe("packages/ztext/tsconfig.json", () => {
  test("targets ES2025", () => {
    expect(tsconfig.compilerOptions.target).toBe("ES2025");
  });

  test("uses ESNext module system", () => {
    expect(tsconfig.compilerOptions.module).toBe("ESNext");
  });

  test("uses bundler module resolution", () => {
    expect(tsconfig.compilerOptions.moduleResolution).toBe("bundler");
  });

  test("has strict mode enabled", () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  test("emits declaration files", () => {
    expect(tsconfig.compilerOptions.declaration).toBe(true);
  });

  test("outputs to dist directory", () => {
    expect(tsconfig.compilerOptions.outDir).toBe("dist");
  });

  test("includes src directory", () => {
    expect(tsconfig.include).toEqual(["src"]);
  });
});
