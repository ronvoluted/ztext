import { describe, expect, test, beforeAll } from "bun:test";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { $ } from "bun";

const buildDir = join(import.meta.dir, "..", "build");
const demoRoot = join(import.meta.dir, "..");

let html: string;

beforeAll(async () => {
	// Build first, then read the fresh output
	// nothrow() because Svelte a11y warnings cause non-zero exit
	await $`cd ${demoRoot} && bun run build`.nothrow().quiet();
	html = readFileSync(join(buildDir, "index.html"), "utf-8");
}, 30_000);

describe("SvelteKit build succeeds", () => {
	test("build directory exists after build", () => {
		expect(existsSync(buildDir)).toBe(true);
	});

	test("index.html is generated", () => {
		expect(existsSync(join(buildDir, "index.html"))).toBe(true);
	});

	test("_app directory is generated", () => {
		expect(existsSync(join(buildDir, "_app"))).toBe(true);
	});

	test("version.json is generated", () => {
		const versionPath = join(buildDir, "_app", "version.json");
		expect(existsSync(versionPath)).toBe(true);
		const version = JSON.parse(readFileSync(versionPath, "utf-8"));
		expect(version).toHaveProperty("version");
	});
});

describe("asset references resolve", () => {
	test("all modulepreload hrefs exist on disk", () => {
		const modulePreloads = html.match(/rel="modulepreload"[^>]*href="([^"]+)"/g) ||
			html.match(/href="([^"]+)"[^>]*rel="modulepreload"/g) || [];

		const hrefs = [...html.matchAll(/href="(\.\/_app\/[^"]+\.js)"/g)].map(
			(m) => m[1],
		);
		expect(hrefs.length).toBeGreaterThan(0);

		for (const href of hrefs) {
			const filePath = join(buildDir, href.replace("./", ""));
			expect(existsSync(filePath)).toBe(true);
		}
	});

	test("all stylesheet hrefs exist on disk", () => {
		const cssHrefs = [...html.matchAll(/href="(\.\/_app\/[^"]+\.css)"/g)].map(
			(m) => m[1],
		);
		expect(cssHrefs.length).toBeGreaterThan(0);

		for (const href of cssHrefs) {
			const filePath = join(buildDir, href.replace("./", ""));
			expect(existsSync(filePath)).toBe(true);
		}
	});

	test("inline script imports valid entry points", () => {
		const imports = [
			...html.matchAll(/import\("(\.\/_app\/[^"]+\.js)"\)/g),
		].map((m) => m[1]);
		expect(imports.length).toBeGreaterThan(0);

		for (const imp of imports) {
			const filePath = join(buildDir, imp.replace("./", ""));
			expect(existsSync(filePath)).toBe(true);
		}
	});
});

describe("CSS assets are valid", () => {
	test("CSS files are non-empty", () => {
		const cssHrefs = [...html.matchAll(/href="(\.\/_app\/[^"]+\.css)"/g)].map(
			(m) => m[1],
		);

		for (const href of cssHrefs) {
			const filePath = join(buildDir, href.replace("./", ""));
			const content = readFileSync(filePath, "utf-8");
			expect(content.length).toBeGreaterThan(100);
		}
	});

	test("CSS contains expected custom properties", () => {
		const cssHrefs = [...html.matchAll(/href="(\.\/_app\/[^"]+\.css)"/g)].map(
			(m) => m[1],
		);
		const allCss = cssHrefs
			.map((href) => readFileSync(join(buildDir, href.replace("./", "")), "utf-8"))
			.join("\n");

		expect(allCss).toContain("--color-red");
		expect(allCss).toContain("--color-blue");
		expect(allCss).toContain("--radius");
	});
});

describe("JS entry points are valid", () => {
	test("start entry point exists", () => {
		const entryDir = join(buildDir, "_app", "immutable", "entry");
		expect(existsSync(entryDir)).toBe(true);

		const files = readdirSync(entryDir);
		expect(files.some((f) => f.startsWith("start."))).toBe(true);
		expect(files.some((f) => f.startsWith("app."))).toBe(true);
	});

	test("node files exist for layout and page", () => {
		const nodesDir = join(buildDir, "_app", "immutable", "nodes");
		expect(existsSync(nodesDir)).toBe(true);

		const files = readdirSync(nodesDir);
		// Node 0 = layout, Node 1 = error, Node 2 = page
		expect(files.some((f) => f.startsWith("0."))).toBe(true);
		expect(files.some((f) => f.startsWith("2."))).toBe(true);
	});
});

describe("pre-rendered HTML structure", () => {
	test("has valid HTML document structure", () => {
		expect(html).toContain("<!doctype html>");
		expect(html).toContain('<html lang="en">');
		expect(html).toContain("</html>");
		expect(html).toContain("<head>");
		expect(html).toContain("</head>");
		expect(html).toContain("<body");
		expect(html).toContain("</body>");
	});

	test("has charset and viewport meta tags", () => {
		expect(html).toContain('<meta charset="utf-8"');
		expect(html).toContain("width=device-width");
	});

	test("has SEO meta tags", () => {
		expect(html).toContain('name="description"');
		expect(html).toContain("3D typography");
		expect(html).toContain('property="og:title"');
		expect(html).toContain('property="og:description"');
	});

	test("has page title", () => {
		expect(html).toContain("<title>ztext.js");
	});

	test("has Google Fonts preconnect and stylesheet", () => {
		expect(html).toContain('rel="preconnect"');
		expect(html).toContain("fonts.googleapis.com");
		expect(html).toContain("fonts.gstatic.com");
		expect(html).toContain("family=Nunito");
		expect(html).toContain("family=Cousine");
	});
});

describe("pre-rendered page content", () => {
	test("has header with ztext.js letters", () => {
		expect(html).toContain('class="header"');
		expect(html).toContain('id="header"');
		// All letters of "ztext.js" should be pre-rendered as individual spans
		for (const letter of ["z", "t", "e", "x", ".", "j", "s"]) {
			expect(html).toContain(`data-z="">${letter}</span>`);
		}
	});

	test("has download section with GitHub link", () => {
		expect(html).toContain('class="download"');
		expect(html).toContain('id="download"');
		expect(html).toContain("github.com");
	});

	test("has initialization section with sub-navigation", () => {
		expect(html).toContain('class="initialization"');
		expect(html).toContain('href="#html-init"');
		expect(html).toContain('href="#js-init"');
	});

	test("has HTML init section with code examples", () => {
		expect(html).toContain('class="html-init"');
		expect(html).toContain('id="html-init"');
		expect(html).toContain("data-z-layers");
		expect(html).toContain("data-z-depth");
	});

	test("has JS init section with Ztextify constructor", () => {
		expect(html).toContain('class="js-init"');
		expect(html).toContain('id="js-init"');
		expect(html).toContain("Ztextify");
	});

	test("has styling section with CSS example", () => {
		expect(html).toContain('class="styling"');
		expect(html).toContain('id="styling"');
		expect(html).toContain("styling-example-primary");
	});

	test("has more section with SVG/Image/Emoji tabs", () => {
		expect(html).toContain('class="more"');
		expect(html).toContain('id="more"');
		expect(html).toContain(">SVG</button>");
		expect(html).toContain(">Image</button>");
		expect(html).toContain(">Emoji</button>");
	});

	test("has all option sections", () => {
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
			expect(html).toContain(`id="${opt}"`);
			expect(html).toContain(`href="#${opt}"`);
		}
	});

	test("has footer with copyright", () => {
		expect(html).toContain('class="footer"');
		expect(html).toContain("Bennett Feely");
	});
});

describe("SvelteKit-specific markers", () => {
	test("body has prerender attribute", () => {
		expect(html).toContain('data-sveltekit-prerender="true"');
	});

	test("has SvelteKit bootstrap script", () => {
		expect(html).toContain("__sveltekit_");
		expect(html).toContain("node_ids");
	});

	test("env.js is generated", () => {
		expect(existsSync(join(buildDir, "_app", "env.js"))).toBe(true);
	});
});

describe("no broken internal anchors", () => {
	test("all href=#id anchors have matching ids in the page", () => {
		const anchorRefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
		expect(anchorRefs.length).toBeGreaterThan(0);

		for (const ref of anchorRefs) {
			expect(html).toContain(`id="${ref}"`);
		}
	});
});
