import { describe, expect, test } from "bun:test";
import { join } from "path";

const rootDir = import.meta.dir;
const gitignore = await Bun.file(join(rootDir, ".gitignore")).text();
const lines = gitignore
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

describe(".gitignore", () => {
  const requiredPatterns = [
    ".DS_Store",
    ".Trashes",
    "node_modules",
    "package-lock.json",
    "dist",
    ".svelte-kit",
    "packages/demo/build",
    ".sass-cache",
    "npm-debug.log",
    ".claude",
  ];

  for (const pattern of requiredPatterns) {
    test(`ignores ${pattern}`, () => {
      expect(lines).toContain(pattern);
    });
  }

  test("does not contain duplicate entries", () => {
    const seen = new Set<string>();
    for (const line of lines) {
      expect(seen.has(line)).toBe(false);
      seen.add(line);
    }
  });
});
