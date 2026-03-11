import { describe, expect, test } from "bun:test";
import { join } from "path";

const pkgDir = import.meta.dir;
const pkg = await Bun.file(join(pkgDir, "package.json")).json();

describe("packages/ztext/package.json", () => {
  test("has correct name", () => {
    expect(pkg.name).toBe("ztext");
  });

  test("has correct version", () => {
    expect(pkg.version).toBe("1.0.1");
  });

  test("is an ES module", () => {
    expect(pkg.type).toBe("module");
  });

  test("main points to dist/ztext.js", () => {
    expect(pkg.main).toBe("dist/ztext.js");
  });

  test("types points to dist/index.d.ts", () => {
    expect(pkg.types).toBe("dist/index.d.ts");
  });

  test("has build script", () => {
    expect(pkg.scripts.build).toBe("bun run scripts/build.ts");
  });

  test("has test script", () => {
    expect(pkg.scripts.test).toBe("bun test");
  });

  test("has no runtime dependencies", () => {
    expect(pkg.dependencies).toBeUndefined();
  });
});
