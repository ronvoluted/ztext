import { describe, expect, it, beforeEach } from "bun:test";
import { Ztextify, init, type ZtextOptions } from "./index";

// Mock CSS.supports to return true for 3D transforms
Object.defineProperty(globalThis, "CSS", {
	value: {
		supports: (_prop: string, value?: string) => {
			if (value === "preserve-3d") return true;
			return false;
		},
	},
	writable: true,
});

function createElement(attrs: Record<string, string> = {}): HTMLElement {
	const el = document.createElement("div");
	el.innerHTML = "Hello";
	for (const [key, value] of Object.entries(attrs)) {
		el.setAttribute(key, value);
	}
	document.body.appendChild(el);
	return el;
}

describe("Ztextify", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("creates the correct number of layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll(".z-layer");
		expect(layers.length).toBe(3);
	});

	it("uses default 10 layers when none specified", () => {
		const el = createElement();
		new Ztextify(el, {});

		const layers = el.querySelectorAll(".z-layer");
		expect(layers.length).toBe(10);
	});

	it("creates z-text and z-layers wrapper structure", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		expect(el.querySelector(".z-text")).toBeTruthy();
		expect(el.querySelector(".z-layers")).toBeTruthy();
	});

	it("applies translateZ transforms to layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, depth: "6px", direction: "both" });

		const layers = el.querySelectorAll(".z-layer");
		for (const layer of layers) {
			expect((layer as HTMLElement).style.transform).toMatch(
				/translateZ\(.+px\)/,
			);
		}
	});

	it("computes correct translateZ for direction 'backwards'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, depth: "6px", direction: "backwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// layer 0: pct=0, z = -0*6 = 0
		expect(layers[0].style.transform).toBe("translateZ(0px)");
		// layer 1: pct=1/3, z = -(1/3)*6 = -2
		expect(layers[1].style.transform).toBe("translateZ(-2px)");
		// layer 2: pct=2/3, z = -(2/3)*6 = -4
		expect(layers[2].style.transform).toBe("translateZ(-4px)");
	});

	it("computes correct translateZ for direction 'forwards'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, depth: "6px", direction: "forwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// layer 0: pct=0, z = -0 + 6 = 6
		expect(layers[0].style.transform).toBe("translateZ(6px)");
		// layer 1: pct=1/3, z = -2 + 6 = 4
		expect(layers[1].style.transform).toBe("translateZ(4px)");
		// layer 2: pct=2/3, z = -4 + 6 = 2
		expect(layers[2].style.transform).toBe("translateZ(2px)");
	});

	it("computes correct translateZ for direction 'both'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, depth: "6px", direction: "both" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// layer 0: pct=0, z = -0 + 3 = 3
		expect(layers[0].style.transform).toBe("translateZ(3px)");
		// layer 1: pct=1/3, z = -2 + 3 = 1
		expect(layers[1].style.transform).toBe("translateZ(1px)");
		// layer 2: pct=2/3, z = -4 + 3 = -1
		expect(layers[2].style.transform).toBe("translateZ(-1px)");
	});

	it("applies fade to duplicate layers when fade is true", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, fade: true });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// First layer should NOT have opacity set
		expect(layers[0].style.opacity).toBe("");
		// Subsequent layers should have reduced opacity
		expect(parseFloat(layers[1].style.opacity)).toBeGreaterThan(0);
		expect(parseFloat(layers[1].style.opacity)).toBeLessThan(1);
		expect(parseFloat(layers[2].style.opacity)).toBeGreaterThan(0);
	});

	it("does not apply fade when fade is false", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, fade: false });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		for (const layer of layers) {
			expect(layer.style.opacity).toBe("");
		}
	});

	it("marks duplicate layers with aria-hidden", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll(".z-layer");
		expect(layers[0].getAttribute("aria-hidden")).toBeNull();
		expect(layers[1].getAttribute("aria-hidden")).toBe("true");
		expect(layers[2].getAttribute("aria-hidden")).toBe("true");
	});

	it("sets pointer-events none on duplicate layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.pointerEvents).toBe("");
		expect(layers[1].style.pointerEvents).toBe("none");
		expect(layers[2].style.pointerEvents).toBe("none");
	});

	it("sets user-select none on duplicate layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.userSelect).toBe("");
		expect(layers[1].style.userSelect).toBe("none");
	});

	it("accepts a CSS selector string", () => {
		const el = createElement();
		el.id = "ztest";
		new Ztextify("#ztest", { layers: 2 });

		const layers = el.querySelectorAll(".z-layer");
		expect(layers.length).toBe(2);
	});

	it("does nothing when zEngaged is false", () => {
		const el = createElement();
		new Ztextify(el, { zEngaged: false });

		expect(el.querySelector(".z-text")).toBeNull();
	});

	it("does nothing when zEngaged is 'false'", () => {
		const el = createElement();
		new Ztextify(el, { zEngaged: "false" });

		expect(el.querySelector(".z-text")).toBeNull();
	});

	it("sets perspective on the element", () => {
		const el = createElement();
		new Ztextify(el, { perspective: "800px" });

		expect(el.style.perspective).toBe("800px");
	});

	it("sets element to inline-block and relative", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		expect(el.style.display).toBe("inline-block");
		expect(el.style.position).toBe("relative");
	});

	it("preserves original innerHTML in each layer", () => {
		const el = document.createElement("div");
		el.innerHTML = "<strong>Bold</strong>";
		document.body.appendChild(el);

		new Ztextify(el, { layers: 2 });

		const layers = el.querySelectorAll(".z-layer");
		expect(layers[0].innerHTML).toBe("<strong>Bold</strong>");
		expect(layers[1].innerHTML).toBe("<strong>Bold</strong>");
	});
});

describe("init", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("initializes elements with data-z attribute", () => {
		const el = createElement({ "data-z": "" });
		init();

		const layers = el.querySelectorAll(".z-layer");
		expect(layers.length).toBe(10);
	});

	it("reads data-z-layers attribute", () => {
		const el = createElement({ "data-z": "", "data-z-layers": "3" });
		init();

		const layers = el.querySelectorAll(".z-layer");
		expect(layers.length).toBe(3);
	});

	it("reads data-z-depth attribute", () => {
		const el = createElement({ "data-z": "", "data-z-depth": "20px", "data-z-layers": "2" });
		init();

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.transform).toContain("px");
	});

	it("reads data-z-fade attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-fade": "true",
			"data-z-layers": "3",
		});
		init();

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[1].style.opacity).not.toBe("");
	});

	it("ignores elements without data-z", () => {
		const el = createElement();
		init();

		expect(el.querySelector(".z-layer")).toBeNull();
	});
});

describe("no 3D support", () => {
	it("Ztextify does nothing when 3D is unsupported", () => {
		const originalCSS = globalThis.CSS;
		Object.defineProperty(globalThis, "CSS", {
			value: { supports: () => false },
			writable: true,
		});

		document.body.innerHTML = "";
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		expect(el.querySelector(".z-layer")).toBeNull();

		Object.defineProperty(globalThis, "CSS", {
			value: originalCSS,
			writable: true,
		});
	});
});
