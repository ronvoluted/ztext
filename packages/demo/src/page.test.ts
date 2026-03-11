import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const pagePath = join(import.meta.dir, "routes", "+page.svelte");
const page = readFileSync(pagePath, "utf-8");

describe("+page.svelte", () => {
	test("imports ZtextPreview component", () => {
		expect(page).toContain("ZtextPreview");
	});

	test("imports examples data", () => {
		expect(page).toContain("examples");
		expect(page).toContain('from "$lib/examples"');
	});

	test("imports Ztextify from ztext", () => {
		expect(page).toContain('import { Ztextify } from "ztext"');
	});

	test("imports onMount from svelte", () => {
		expect(page).toContain('import { onMount } from "svelte"');
	});

	test("uses Svelte 5 $state rune", () => {
		expect(page).toContain("$state(");
	});

	test("has header section with animated letters", () => {
		expect(page).toContain('class="header"');
		expect(page).toContain("id=\"header\"");
		// Each letter of "ztext.js" should be a separate span
		expect(page).toContain("<span data-z>z</span>");
		expect(page).toContain("<span data-z>t</span>");
		expect(page).toContain("<span data-z>e</span>");
		expect(page).toContain("<span data-z>x</span>");
		expect(page).toContain("<span data-z>.</span>");
		expect(page).toContain("<span data-z>j</span>");
		expect(page).toContain("<span data-z>s</span>");
	});

	test("has download section", () => {
		expect(page).toContain('class="download"');
		expect(page).toContain("id=\"download\"");
		expect(page).toContain("Download");
	});

	test("has initialization section", () => {
		expect(page).toContain('class="initialization"');
		expect(page).toContain("id=\"initialization\"");
		expect(page).toContain("Initialization");
		expect(page).toContain("How it works");
	});

	test("has HTML init section", () => {
		expect(page).toContain('class="html-init"');
		expect(page).toContain("id=\"html-init\"");
		expect(page).toContain("Initialize with HTML attributes");
	});

	test("has JS init section", () => {
		expect(page).toContain('class="js-init"');
		expect(page).toContain("id=\"js-init\"");
		expect(page).toContain("Initialize with JavaScript");
	});

	test("has styling section", () => {
		expect(page).toContain('class="styling"');
		expect(page).toContain("id=\"styling\"");
		expect(page).toContain("Styling");
		expect(page).toContain("styling-example-primary");
	});

	test("has 'more' section with SVG, image, emoji demos", () => {
		expect(page).toContain('class="more"');
		expect(page).toContain("id=\"more\"");
		expect(page).toContain("But wait, there's more!");
		expect(page).toContain("svg-code-example");
		expect(page).toContain("img-code-example");
		expect(page).toContain("emoji-code-example");
	});

	test("has toggle buttons for SVG/Image/Emoji tabs", () => {
		expect(page).toContain('class="toggle"');
		expect(page).toContain(">SVG</button>");
		expect(page).toContain(">Image</button>");
		expect(page).toContain(">Emoji</button>");
	});

	test("has pause animation button", () => {
		expect(page).toContain("pause");
		expect(page).toContain("Pause");
	});

	test("has options section with all option demos", () => {
		expect(page).toContain('class="options"');
		expect(page).toContain("id=\"options\"");
		expect(page).toContain("Options");
	});

	test("has depth option", () => {
		expect(page).toContain("depth-option");
		expect(page).toContain("id=\"depth\"");
		expect(page).toContain('href="#depth"');
	});

	test("has layers option", () => {
		expect(page).toContain("layers-option");
		expect(page).toContain("id=\"layers\"");
		expect(page).toContain('href="#layers"');
	});

	test("has perspective option", () => {
		expect(page).toContain("perspective-option");
		expect(page).toContain("id=\"perspective\"");
		expect(page).toContain('href="#perspective"');
	});

	test("has fade option", () => {
		expect(page).toContain("fade-option");
		expect(page).toContain("id=\"fade\"");
		expect(page).toContain('href="#fade"');
	});

	test("has direction option", () => {
		expect(page).toContain("direction-option");
		expect(page).toContain("id=\"direction\"");
		expect(page).toContain('href="#direction"');
	});

	test("has event option", () => {
		expect(page).toContain("event-option");
		expect(page).toContain("id=\"event\"");
		expect(page).toContain('href="#event"');
	});

	test("has eventRotation option", () => {
		expect(page).toContain("event-rotation-option");
		expect(page).toContain("id=\"eventRotation\"");
		expect(page).toContain('href="#eventRotation"');
	});

	test("has eventDirection option", () => {
		expect(page).toContain("event-direction-option");
		expect(page).toContain("id=\"eventDirection\"");
		expect(page).toContain('href="#eventDirection"');
	});

	test("has footer", () => {
		expect(page).toContain('class="footer"');
		expect(page).toContain("Bennett Feely");
	});

	test("initializes header letters with Ztextify on mount", () => {
		expect(page).toContain("headerEl");
		expect(page).toContain("new Ztextify(el");
	});

	test("initializes options section data-z elements on mount", () => {
		expect(page).toContain("optionsEl");
		expect(page).toContain('querySelectorAll<HTMLElement>("[data-z]")');
	});

	test("uses reactive toggle state for more section tabs", () => {
		expect(page).toContain("activeTab");
		expect(page).toContain("animationPlaying");
	});

	test("does not use Svelte 4 slot syntax", () => {
		expect(page).not.toContain("<slot");
	});
});
