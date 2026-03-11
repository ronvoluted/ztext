import { describe, expect, test } from "bun:test";
import { examples } from "./lib/examples";
import type { Example } from "./lib/examples";

describe("examples", () => {
	test("exports an array of 14 examples", () => {
		expect(Array.isArray(examples)).toBe(true);
		expect(examples).toHaveLength(14);
	});

	test("each example has required fields", () => {
		for (const ex of examples) {
			expect(typeof ex.selector).toBe("string");
			expect(typeof ex.text).toBe("string");
			expect(typeof ex.html).toBe("string");
			expect(typeof ex.css).toBe("string");
			expect(typeof ex.js).toBe("string");
			expect(typeof ex.copy).toBe("object");
			expect(typeof ex.copy.enabled).toBe("boolean");
			expect(typeof ex.copy.target).toBe("string");
		}
	});

	test("selectors are sequential .menu-N classes", () => {
		examples.forEach((ex, i) => {
			expect(ex.selector).toBe(`.menu-${i}`);
		});
	});

	test("first three examples have 'Edit in CodePen' text", () => {
		expect(examples[0].text).toBe("Edit in CodePen");
		expect(examples[1].text).toBe("Edit in CodePen");
		expect(examples[2].text).toBe("Edit in CodePen");
	});

	test("examples 3+ have 'Edit' text", () => {
		for (let i = 3; i < examples.length; i++) {
			expect(examples[i].text).toBe("Edit");
		}
	});

	test("copy targets match selector index when enabled", () => {
		examples.forEach((ex, i) => {
			if (ex.copy.enabled) {
				expect(ex.copy.target).toBe(`#copy-${i}`);
			}
		});
	});

	test("first 6 examples have copy enabled", () => {
		for (let i = 0; i < 6; i++) {
			expect(examples[i].copy.enabled).toBe(true);
		}
	});

	test("examples 6-13 have copy disabled", () => {
		for (let i = 6; i < examples.length; i++) {
			expect(examples[i].copy.enabled).toBe(false);
		}
	});

	test("html fields contain ztext data attributes or class references", () => {
		for (const ex of examples) {
			expect(ex.html.includes("data-z") || ex.html.includes("hero-text")).toBe(
				true,
			);
		}
	});

	test("css fields contain styling rules", () => {
		for (const ex of examples) {
			expect(ex.css.length).toBeGreaterThan(0);
		}
	});

	test("wobble keyframes are included in examples that use animation", () => {
		const wobbleExamples = examples.filter((ex) =>
			ex.css.includes("animation: wobble"),
		);
		for (const ex of wobbleExamples) {
			expect(ex.css).toContain("@keyframes wobble");
		}
	});

	test("only example 1 has js content", () => {
		expect(examples[1].js).toContain("Ztextify");
		const others = examples.filter((_, i) => i !== 1);
		for (const ex of others) {
			expect(ex.js).toBe("");
		}
	});

	test("example 3 contains SVG markup", () => {
		expect(examples[3].html).toContain("<svg");
		expect(examples[3].html).toContain("</svg>");
	});

	test("example 4 contains img tag", () => {
		expect(examples[4].html).toContain("<img");
	});

	test("example 5 contains emoji", () => {
		expect(examples[5].html).toContain("😂");
	});
});
