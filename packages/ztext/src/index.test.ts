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

describe("Ztextify — depth units", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("supports rem units", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2, depth: "3rem", direction: "backwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.transform).toBe("translateZ(0rem)");
		expect(layers[1].style.transform).toBe("translateZ(-1.5rem)");
	});

	it("supports em units", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2, depth: "4em", direction: "backwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.transform).toBe("translateZ(0em)");
		expect(layers[1].style.transform).toBe("translateZ(-2em)");
	});

	it("supports vh units", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2, depth: "10vh", direction: "backwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[1].style.transform).toBe("translateZ(-5vh)");
	});

	it("uses default depth of 1rem when none specified", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2, direction: "backwards" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.transform).toBe("translateZ(0rem)");
		expect(layers[1].style.transform).toBe("translateZ(-0.5rem)");
	});
});

describe("Ztextify — DOM structure", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("sets transform-style preserve-3d on z-text wrapper", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		const zText = el.querySelector<HTMLElement>(".z-text");
		expect(zText!.style.transformStyle).toBe("preserve-3d");
	});

	it("sets transform-style preserve-3d on z-layers wrapper", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		const zLayers = el.querySelector<HTMLElement>(".z-layers");
		expect(zLayers!.style.transformStyle).toBe("preserve-3d");
	});

	it("sets display inline-block on z-text and z-layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		const zText = el.querySelector<HTMLElement>(".z-text");
		const zLayers = el.querySelector<HTMLElement>(".z-layers");
		expect(zText!.style.display).toBe("inline-block");
		expect(zLayers!.style.display).toBe("inline-block");
	});

	it("nests z-layers inside z-text", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		const zText = el.querySelector(".z-text");
		expect(zText!.querySelector(".z-layers")).toBeTruthy();
	});

	it("nests z-layer elements inside z-layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const zLayers = el.querySelector(".z-layers");
		const layers = zLayers!.querySelectorAll(".z-layer");
		expect(layers.length).toBe(3);
	});

	it("positions duplicate layers absolutely", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.position).toBe("");
		expect(layers[1].style.position).toBe("absolute");
		expect(layers[2].style.position).toBe("absolute");
	});

	it("sets top and left to 0 on duplicate layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[1].style.top).toMatch(/^0(px)?$/);
		expect(layers[1].style.left).toMatch(/^0(px)?$/);
		expect(layers[2].style.top).toMatch(/^0(px)?$/);
		expect(layers[2].style.left).toMatch(/^0(px)?$/);
	});

	it("clears original innerHTML and replaces with z-text structure", () => {
		const el = createElement();
		el.innerHTML = "Original Text";
		new Ztextify(el, { layers: 2 });

		// Original text is gone, replaced by z-text wrapper
		expect(el.children.length).toBe(1);
		expect(el.children[0].className).toBe("z-text");
	});

	it("sets display inline-block on each layer", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3 });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		for (const layer of layers) {
			expect(layer.style.display).toBe("inline-block");
		}
	});
});

describe("Ztextify — multiple elements", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("applies effect to multiple elements matching selector", () => {
		const el1 = createElement();
		el1.classList.add("ztest-multi");
		const el2 = createElement();
		el2.classList.add("ztest-multi");

		new Ztextify(".ztest-multi", { layers: 2 });

		expect(el1.querySelectorAll(".z-layer").length).toBe(2);
		expect(el2.querySelectorAll(".z-layer").length).toBe(2);
	});
});

describe("Ztextify — fade calculations", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("computes correct opacity values for fade layers", () => {
		const el = createElement();
		new Ztextify(el, { layers: 4, fade: true });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// layer 0: no opacity
		expect(layers[0].style.opacity).toBe("");
		// layer 1: pct=1/4=0.25, opacity = (1-0.25)/2 = 0.375
		expect(parseFloat(layers[1].style.opacity)).toBeCloseTo(0.375, 3);
		// layer 2: pct=2/4=0.5, opacity = (1-0.5)/2 = 0.25
		expect(parseFloat(layers[2].style.opacity)).toBeCloseTo(0.25, 3);
		// layer 3: pct=3/4=0.75, opacity = (1-0.75)/2 = 0.125
		expect(parseFloat(layers[3].style.opacity)).toBeCloseTo(0.125, 3);
	});

	it("accepts fade as string 'true'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, fade: "true" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		expect(layers[0].style.opacity).toBe("");
		expect(parseFloat(layers[1].style.opacity)).toBeGreaterThan(0);
	});

	it("does not apply fade when fade is string 'false'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 3, fade: "false" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		for (const layer of layers) {
			expect(layer.style.opacity).toBe("");
		}
	});
});

describe("Ztextify — zEngaged variations", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("applies effect when zEngaged is true", () => {
		const el = createElement();
		new Ztextify(el, { zEngaged: true, layers: 2 });

		expect(el.querySelectorAll(".z-layer").length).toBe(2);
	});

	it("applies effect when zEngaged is string 'true'", () => {
		const el = createElement();
		new Ztextify(el, { zEngaged: "true", layers: 2 });

		expect(el.querySelectorAll(".z-layer").length).toBe(2);
	});

	it("applies effect when zEngaged is not specified (default true)", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2 });

		expect(el.querySelectorAll(".z-layer").length).toBe(2);
	});
});

describe("Ztextify — default options", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("uses default perspective of 500px", () => {
		const el = createElement();
		new Ztextify(el, {});

		expect(el.style.perspective).toBe("500px");
	});

	it("uses default direction 'both'", () => {
		const el = createElement();
		new Ztextify(el, { layers: 2, depth: "4px" });

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// both: layer 0: pct=0, z = -0 + 2 = 2
		expect(layers[0].style.transform).toBe("translateZ(2px)");
		// both: layer 1: pct=0.5, z = -2 + 2 = 0
		expect(layers[1].style.transform).toBe("translateZ(0px)");
	});

	it("accepts empty options object", () => {
		const el = createElement();
		new Ztextify(el, {});

		expect(el.querySelectorAll(".z-layer").length).toBe(10);
	});

	it("works with no options argument", () => {
		const el = createElement();
		new Ztextify(el);

		expect(el.querySelectorAll(".z-layer").length).toBe(10);
	});
});

describe("Ztextify — event listeners", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("registers mousemove listener for pointer event", () => {
		const el = createElement();
		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		new Ztextify(el, { event: "pointer", layers: 2 });

		expect(calls).toContain("mousemove");
		expect(calls).toContain("touchmove");

		globalThis.window.addEventListener = addEventSpy;
	});

	it("registers scroll listener for scroll event", () => {
		const el = createElement();
		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		new Ztextify(el, { event: "scroll", layers: 2 });

		expect(calls).toContain("scroll");

		globalThis.window.addEventListener = addEventSpy;
	});

	it("registers scroll listener for scrollX event", () => {
		const el = createElement();
		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		new Ztextify(el, { event: "scrollX", layers: 2 });

		expect(calls).toContain("scroll");

		globalThis.window.addEventListener = addEventSpy;
	});

	it("registers scroll listener for scrollY event", () => {
		const el = createElement();
		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		new Ztextify(el, { event: "scrollY", layers: 2 });

		expect(calls).toContain("scroll");

		globalThis.window.addEventListener = addEventSpy;
	});

	it("does not register event listeners when event is 'none'", () => {
		const el = createElement();
		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		new Ztextify(el, { event: "none", layers: 2 });

		expect(calls).not.toContain("mousemove");
		expect(calls).not.toContain("touchmove");
		expect(calls).not.toContain("scroll");

		globalThis.window.addEventListener = addEventSpy;
	});
});

describe("init — data attribute options", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("reads data-z-direction attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-direction": "forwards",
			"data-z-layers": "2",
			"data-z-depth": "6px",
		});
		init();

		const layers = el.querySelectorAll<HTMLElement>(".z-layer");
		// forwards: layer 0: pct=0, z = -0 + 6 = 6
		expect(layers[0].style.transform).toBe("translateZ(6px)");
	});

	it("reads data-z-perspective attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-perspective": "900px",
			"data-z-layers": "2",
		});
		init();

		expect(el.style.perspective).toBe("900px");
	});

	it("reads data-z-event attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-event": "pointer",
			"data-z-layers": "2",
		});

		const addEventSpy = globalThis.window.addEventListener;
		const calls: string[] = [];
		globalThis.window.addEventListener = function (type: string, ...args: any[]) {
			calls.push(type);
			return addEventSpy.call(this, type, ...args);
		} as typeof window.addEventListener;

		init();

		expect(calls).toContain("mousemove");

		globalThis.window.addEventListener = addEventSpy;
	});

	it("reads data-z-eventrotation attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-eventrotation": "45deg",
			"data-z-layers": "2",
		});
		init();

		// Verifies it doesn't throw and initializes correctly
		expect(el.querySelectorAll(".z-layer").length).toBe(2);
	});

	it("reads data-z-eventdirection attribute", () => {
		const el = createElement({
			"data-z": "",
			"data-z-eventdirection": "reverse",
			"data-z-layers": "2",
		});
		init();

		expect(el.querySelectorAll(".z-layer").length).toBe(2);
	});

	it("disables effect when data-z='false'", () => {
		const el = createElement({ "data-z": "false" });
		init();

		expect(el.querySelector(".z-layer")).toBeNull();
	});

	it("initializes multiple data-z elements", () => {
		const el1 = createElement({ "data-z": "", "data-z-layers": "2" });
		const el2 = createElement({ "data-z": "", "data-z-layers": "3" });
		init();

		expect(el1.querySelectorAll(".z-layer").length).toBe(2);
		expect(el2.querySelectorAll(".z-layer").length).toBe(3);
	});

	it("uses default layers when data-z-layers is invalid", () => {
		const el = createElement({ "data-z": "", "data-z-layers": "abc" });
		init();

		expect(el.querySelectorAll(".z-layer").length).toBe(10);
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

	it("init logs error when 3D is unsupported", () => {
		const originalCSS = globalThis.CSS;
		Object.defineProperty(globalThis, "CSS", {
			value: { supports: () => false },
			writable: true,
		});

		const originalError = console.error;
		const errors: string[] = [];
		console.error = (...args: any[]) => errors.push(args.join(" "));

		document.body.innerHTML = "";
		createElement({ "data-z": "" });
		init();

		expect(errors.length).toBe(1);
		expect(errors[0]).toContain("transform-style: preserve-3d");

		console.error = originalError;
		Object.defineProperty(globalThis, "CSS", {
			value: originalCSS,
			writable: true,
		});
	});

	it("init does not process elements when 3D is unsupported", () => {
		const originalCSS = globalThis.CSS;
		Object.defineProperty(globalThis, "CSS", {
			value: { supports: () => false },
			writable: true,
		});

		document.body.innerHTML = "";
		const el = createElement({ "data-z": "", "data-z-layers": "3" });

		const originalError = console.error;
		console.error = () => {};
		init();
		console.error = originalError;

		expect(el.querySelector(".z-layer")).toBeNull();

		Object.defineProperty(globalThis, "CSS", {
			value: originalCSS,
			writable: true,
		});
	});

	it("Ztextify with string selector does nothing when 3D is unsupported", () => {
		const originalCSS = globalThis.CSS;
		Object.defineProperty(globalThis, "CSS", {
			value: { supports: () => false },
			writable: true,
		});

		document.body.innerHTML = "";
		const el = createElement();
		el.id = "no3d-test";
		new Ztextify("#no3d-test", { layers: 3 });

		expect(el.querySelector(".z-layer")).toBeNull();

		Object.defineProperty(globalThis, "CSS", {
			value: originalCSS,
			writable: true,
		});
	});
});
