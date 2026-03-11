<script lang="ts">
	import { onMount } from "svelte";
	import { Ztextify } from "ztext";
	import type { Example } from "./examples";
	import { scopeCSS } from "./scope-css";

	interface Props {
		example: Example;
	}

	let { example }: Props = $props();

	let previewEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!previewEl) return;

		const content = previewEl.querySelector<HTMLElement>(".ztext-preview-content")!;
		content.innerHTML = example.html;

		const styleEl = document.createElement("style");
		const scope = `[data-preview="${example.selector}"]`;
		styleEl.textContent = scopeCSS(example.css, scope);
		content.appendChild(styleEl);

		const elements = content.querySelectorAll<HTMLElement>("[data-z]");
		for (const el of elements) {
			new Ztextify(el, {
				depth: el.dataset.zDepth,
				direction: el.dataset.zDirection as any,
				event: el.dataset.zEvent as any,
				eventRotation: el.dataset.zEventrotation,
				eventDirection: el.dataset.zEventdirection as any,
				fade: el.dataset.zFade,
				layers: el.dataset.zLayers ? parseInt(el.dataset.zLayers) : undefined,
				perspective: el.dataset.zPerspective,
			});
		}

		// Handle JS-constructor examples (e.g. example 1 with .hero-text)
		if (example.js) {
			const selectorMatch = example.js.match(/Ztextify\("([^"]+)"/);
			const optsMatch = example.js.match(/\{[\s\S]*\}/);
			if (selectorMatch && optsMatch) {
				try {
					const opts = new Function(`return ${optsMatch[0]}`)();
					const targets = content.querySelectorAll<HTMLElement>(selectorMatch[1]);
					for (const el of targets) {
						new Ztextify(el, opts);
					}
				} catch {
					// ignore parse errors
				}
			}
		}
	});

</script>

<div class="ztext-preview" bind:this={previewEl} data-preview={example.selector}>
	<div class="ztext-preview-content"></div>
</div>

<style>
	.ztext-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		padding: 2rem;
	}

	.ztext-preview-content {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
</style>
