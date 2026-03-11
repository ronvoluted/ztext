<script lang="ts">
	import { onMount } from "svelte";
	import { Ztextify } from "ztext";
	import ZtextPreview from "$lib/ZtextPreview.svelte";
	import { examples } from "$lib/examples";

	let headerEl: HTMLElement | undefined = $state();
	let htmlInitPreviewEl: HTMLElement | undefined = $state();
	let stylingPreviewEl: HTMLElement | undefined = $state();
	let morePreviewEl: HTMLElement | undefined = $state();
	let optionsEl: HTMLElement | undefined = $state();

	// "More" section toggle state
	let activeTab: "svg" | "img" | "emoji" = $state("emoji");
	let animationPlaying = $state(false);

	function setTab(tab: "svg" | "img" | "emoji") {
		activeTab = tab;
		animationPlaying = true;
	}

	function pauseAnimation() {
		animationPlaying = false;
	}

	onMount(() => {
		// Initialize header letters
		if (headerEl) {
			const els = headerEl.querySelectorAll<HTMLElement>("[data-z]");
			for (const el of els) {
				new Ztextify(el, {
					depth: ".15em",
					event: "pointer",
					eventRotation: "40deg",
				});
			}
		}

		// Initialize HTML-init preview
		if (htmlInitPreviewEl) {
			const el = htmlInitPreviewEl.querySelector<HTMLElement>("[data-z]");
			if (el) {
				new Ztextify(el, {
					layers: 3,
					depth: ".5em",
				});
			}
		}

		// Initialize styling preview
		if (stylingPreviewEl) {
			const el = stylingPreviewEl.querySelector<HTMLElement>("[data-z]");
			if (el) {
				new Ztextify(el);
			}
		}

		// Initialize "More" section previews
		if (morePreviewEl) {
			const svgEl = morePreviewEl.querySelector<HTMLElement>(".svg-code-example");
			if (svgEl) new Ztextify(svgEl, { layers: 15, depth: "50px" });

			const imgEl = morePreviewEl.querySelector<HTMLElement>(".img-code-example");
			if (imgEl) new Ztextify(imgEl, { depth: "40px" });

			const emojiEl = morePreviewEl.querySelector<HTMLElement>(".emoji-code-example");
			if (emojiEl) new Ztextify(emojiEl, { layers: 20, depth: "50px" });
		}

		// Initialize options section previews
		if (optionsEl) {
			const els = optionsEl.querySelectorAll<HTMLElement>("[data-z]");
			for (const el of els) {
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
		}
	});
</script>

<!-- Header -->
<header class="header" id="header" bind:this={headerEl}>
	<div class="wrapper">
		<div class="container">
			<h1><span data-z>z</span></h1>
			<h1><span data-z>t</span></h1>
			<h1><span data-z>e</span></h1>
			<h1><span data-z>x</span></h1>
			<h1><span data-z>t</span></h1>
			<h1><span data-z>.</span></h1>
			<h1><span data-z>j</span></h1>
			<h1><span data-z>s</span></h1>
			<h2>Easy to implement, 3D typography for the web. Works with every font.</h2>
		</div>
	</div>
</header>

<!-- Main content -->
<main class="main">
	<div class="wrapper">
		<div class="split">
			<div class="split-item">
				<section class="download" id="download">
					<div class="container">
						<h2>Download</h2>
						<a class="button" href="https://github.com/nicholasgasior/ztext">
							<strong>ztext.js</strong> &mdash; Lightweight 3D typography
						</a>
						<p>
							<a class="external" href="https://github.com/nicholasgasior/ztext">View on GitHub</a>
						</p>
					</div>
				</section>
			</div>
		</div>
	</div>

	<!-- Initialization -->
	<section class="initialization" id="initialization">
		<div class="wrapper">
			<div class="container">
				<div class="split">
					<div class="split-item shrink">
						<h2>Initialization</h2>
						<p>There are multiple ways to use ztext. Pick whichever method is easiest for you.</p>
						<ol>
							<li><a href="#html-init">HTML attributes</a></li>
							<li><a href="#js-init">Vanilla JavaScript</a></li>
						</ol>
					</div>
					<div class="split-item">
						<h3>How it works</h3>
						<p>
							Ztext gives the illusion of volume by creating layers from an HTML element.
							There's no need to spend hours fiddling with
							<code class="light"><span class="red-code">&lt;canvas&gt;</span></code>
							or forcing users to download multi-megabyte WebGL libraries. With ztext, content
							remains fully selectable and accessible.
						</p>
						<p>
							<a class="external" href="https://caniuse.com/#feat=transforms3d">Over 98% of users</a>
							use a web browser that supports the CSS
							<code class="light"><span class="yellow-code">transform-style</span></code>
							property, which ztext needs to work. In unsupported browsers, ztext gracefully turns off.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- HTML Init -->
	<section class="html-init" id="html-init">
		<div class="wrapper">
			<div class="container">
				<h3>Initialize with HTML attributes</h3>
				<p>
					Include <code class="light"><span class="green-code">ztext.min.js</span></code> on your
					site before the closing
					<code class="light"><span class="red-code">&lt;/body&gt;</span></code> tag on your HTML
					file. For example:
				</p>
				<pre class="dark"><h3>HTML</h3><code><span class="red-code">&lt;script src</span>=<span class="green-code">"/path/to/ztext.min.js"</span><span class="red-code">&gt;&lt;/script&gt;</span></code></pre>
				<p>
					With this method, ztext will look for any HTML element with the
					<code class="light"><span class="yellow-code">data-z</span></code> or
					<code class="light"><span class="yellow-code">data-z</span>=<span class="green-code">"true"</span></code>
					attribute and will apply a 3D effect to it.
				</p>
				<p>
					See <a href="#options">Options</a> below for a full list of possible
					<code class="light"><span class="yellow-code">data-z-XXXXX</span></code> attributes.
				</p>

				<div class="split">
					<div class="split-item">
						<pre class="dark"><h3>HTML</h3><code><span class="red-code">&lt;h1&gt;</span><br />   <span class="red-code">&lt;span</span> <span class="yellow-code">data-z</span> <span class="yellow-code">data-z-layers</span>=<span class="green-code">"3"</span> <span class="yellow-code">data-z-depth</span>=<span class="green-code">"0.5em"</span><span class="red-code">&gt;</span>A<span class="red-code">&lt;/span&gt;</span><br /><span class="red-code">&lt;/h1&gt;</span></code></pre>
						<p>Structurally, ztext turns that code into this:</p>
						<pre class="light"><code>&lt;h1 data-z data-z-layers="3" data-z-depth="0.5em"&gt;<br />&nbsp;&nbsp;&nbsp;&lt;span class="z-text"&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;span class="z-layers"&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;span class="z-layer"&gt;A&lt;/span&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;span class="z-layer"&gt;A&lt;/span&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;span class="z-layer"&gt;A&lt;/span&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/span&gt;<br />&nbsp;&nbsp;&nbsp;&lt;/span&gt;<br />&lt;/h1&gt;</code></pre>
					</div>
					<div class="split-item">
						<div class="preview" bind:this={htmlInitPreviewEl}>
							<h3>Preview</h3>
							<h1 class="x-large" data-z data-z-layers="3" data-z-depth=".5em">A</h1>
						</div>
						<p>
							The duplicate layers are visible to users but ztext makes them hidden from screen
							readers and other forms of user interaction.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- JS Init -->
	<section class="js-init" id="js-init">
		<div class="wrapper">
			<div class="container">
				<h3>Initialize with JavaScript</h3>
				<p>
					Use ztext with vanilla JS with
					<code class="light"><span class="purple-code">new</span> <span class="red-code">Ztextify</span><span class="blue-code">(</span><span class="green-code">selector</span>, <span class="blue-code">{"{"}{"}"})</span></code>.
					This constructor accepts two arguments: the HTML element selector and an options object.
				</p>
				<pre class="dark"><h3>JS</h3><code><span class="purple-code">var</span> <span class="red-code">ztxt</span> <span class="blue-code">=</span> <span class="purple-code">new</span> <span class="red-code">Ztextify</span><span class="blue-code">(</span><span class="green-code">".hero-text"</span><span class="blue-code">,</span> <span class="blue-code">{"{"}</span><br />   <span class="blue-code">depth</span>: <span class="green-code">"30px"</span>,<br />   <span class="blue-code">layers</span>: <span class="orange-code">8</span>,<br />   <span class="blue-code">fade</span>: <span class="orange-code">true</span>,<br />   <span class="blue-code">direction</span>: <span class="green-code">"forwards"</span>,<br />   <span class="blue-code">event</span>: <span class="green-code">"pointer"</span>,<br />   <span class="blue-code">eventRotation</span>: <span class="green-code">"35deg"</span><br /><span class="blue-code">{"}"}</span>);</code></pre>
			</div>
		</div>
	</section>

	<!-- Styling -->
	<section class="styling" id="styling">
		<div class="wrapper">
			<div class="container">
				<h2>Styling</h2>
				<p>
					Start with this CSS snippet and style ztext any way you want. Ztext works with absolutely
					any font that works on the web. Plus, it's easy to integrate with CSS animations and
					transitions.
				</p>
				<div class="split">
					<div class="split-item">
						<pre class="dark"><h3>CSS</h3><code><span class="red-code">h1</span> {"{"}<br />   <span class="yellow-code">font</span>: <span class="orange-code">bold</span> <span class="orange-code">5em</span> <span class="green-code">"Georgia"</span>, <span class="orange-code">serif</span>;<br />   <span class="yellow-code">color</span>: <span class="aqua-code">#90a4ae</span>;<span class="dot" style="background:#90a4ae"></span><br />{"}"}<br /><br /><span class="red-code">.z-text</span> {"{"}<br />   <span class="gray-code">/* Tip: Apply CSS transforms here */</span><br />   <span class="gray-code">/* rotateX() == up/down */</span><br />   <span class="gray-code">/* rotateY() == left/right */</span><br />   <span class="yellow-code">transform</span>: <span class="blue-code">rotateX</span>(<span class="orange-code">15deg</span>) <span class="blue-code">rotateY</span>(<span class="orange-code">-30deg</span>);<br />{"}"}<br /><br /><span class="red-code">.z-layer:not(:first-child)</span> {"{"}<br />   <span class="yellow-code">color</span>: <span class="aqua-code">#455a64</span>;<span class="dot" style="background:#455a64"></span><br />{"}"}</code></pre>
					</div>
					<div class="split-item preview styling-example-primary" bind:this={stylingPreviewEl}>
						<h1 class="large" data-z>CSS</h1>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- More (SVG, Image, Emoji) -->
	<section class="more" id="more">
		<div class="wrapper">
			<div class="container">
				<h2>But wait, there's more!</h2>
				<p>Ztext isn't just for text. Add a third dimension to SVG, emojis, and images.</p>
				<div class="split">
					<div class="split-item">
						<div class="toggle-menu">
							<button
								class="toggle"
								class:is-on={activeTab === "svg"}
								onclick={() => setTab("svg")}
							>SVG</button>
							<button
								class="toggle"
								class:is-on={activeTab === "img"}
								onclick={() => setTab("img")}
							>Image</button>
							<button
								class="toggle"
								class:is-on={activeTab === "emoji"}
								onclick={() => setTab("emoji")}
							>Emoji</button>
						</div>
						<pre class="dark">
							<h3>HTML</h3>
							{#if activeTab === "svg"}
								<div class="tab is-on"><code><span class="red-code">&lt;span <span class="yellow-code">data-z</span></span> <span class="yellow-code">data-z-layers</span>=<span class="green-code">"15"</span> <span class="yellow-code">data-z-depth</span>=<span class="green-code">"50px"</span><span class="red-code">&gt;</span><br />   <span class="red-code">&lt;svg</span> <span class="yellow-code">xmlns</span>=<span class="green-code">"http://www.w3.org/2000/svg"</span> <span class="yellow-code">viewBox</span>=<span class="green-code">"0 0 400 400"</span> <span class="yellow-code">width</span>=<span class="green-code">"200"</span> <span class="yellow-code">height</span>=<span class="green-code">"200"</span><span class="red-code">&gt;</span><br />       <span class="red-code">&lt;path</span> <span class="yellow-code">d</span>=<span class="green-code">"..."</span><span class="red-code"> /&gt;</span><br />    <span class="red-code">&lt;/svg&gt;</span><br /><span class="red-code">&lt;/span&gt;</span></code></div>
							{:else if activeTab === "img"}
								<div class="tab is-on"><code><span class="red-code">&lt;span <span class="yellow-code">data-z</span> <span class="yellow-code">data-z-depth</span>=<span class="green-code">"40px"</span>&gt;</span><br />   <span class="red-code">&lt;img</span> <span class="yellow-code">width</span>=<span class="green-code">"150"</span> <span class="yellow-code">height</span>=<span class="green-code">"120"</span> <span class="yellow-code">src</span>=<span class="green-code">"images/grace.jpg"</span> <span class="yellow-code">alt</span>=<span class="green-code">"Photo of Grace"</span><span class="red-code">&gt;</span><br /><span class="red-code">&lt;span&gt;</span></code></div>
							{:else}
								<div class="tab is-on"><code><span class="red-code">&lt;span</span> <span class="yellow-code">data-z</span> <span class="yellow-code">data-z-layers</span>=<span class="green-code">"20"</span> <span class="yellow-code">data-z-depth</span>=<span class="green-code">"50px"</span><span class="red-code">&gt;</span>😂🔥🍔<span class="red-code">&lt;/span&gt;</span></code></div>
							{/if}
						</pre>
						<pre class="dark"><h3>CSS</h3><code><span class="red-code">.z-layer:not(:first-child)</span> {"{"}<br />   <span class="yellow-code">filter</span>: <span class="blue-code">brightness</span>(<span class="orange-code">0.7</span>);<br />{"}"}</code></pre>
					</div>
					<div class="split-item preview" bind:this={morePreviewEl}>
						<button class="button pause" class:is-on={animationPlaying} onclick={pauseAnimation}>
							Pause
						</button>
						<span
							class="svg-code-example"
							class:is-on={activeTab === "svg" && animationPlaying}
						>
							<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
								<path
									d="M153.62 301.59c94.34 0 145.94-78.16 145.94-145.94 0-2.22 0-4.43-.15-6.63A104.36 104.36 0 00325 122.47a102.38 102.38 0 01-29.46 8.07 51.47 51.47 0 0022.55-28.37 102.79 102.79 0 01-32.57 12.45 51.34 51.34 0 00-87.41 46.78A145.62 145.62 0 0192.4 107.81a51.33 51.33 0 0015.88 68.47A50.91 50.91 0 0185 169.86v.65a51.31 51.31 0 0041.15 50.28 51.21 51.21 0 01-23.16.88 51.35 51.35 0 0047.92 35.62 102.92 102.92 0 01-63.7 22 104.41 104.41 0 01-12.21-.74 145.21 145.21 0 0078.62 23"
									stroke="#1da1f2"
									stroke-width="10px"
									fill="none"
								/>
							</svg>
						</span>
						<span
							class="img-code-example"
							class:is-on={activeTab === "img" && animationPlaying}
						>
							<img src="https://bennettfeely.com/ztext/img/grace.jpg" width="500" height="400" alt="Photo of Grace" />
						</span>
						<span
							class="emoji-code-example"
							class:is-on={activeTab === "emoji" && animationPlaying}
						>😂🔥🍔</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Options -->
	<section class="options" id="options" bind:this={optionsEl}>
		<div class="wrapper">
			<!-- Depth -->
			<div class="container option depth-option" id="depth">
				<h2>Options</h2>
				<div class="split">
					<div class="split-item preview">
						<h1 class="medium" data-z>1rem</h1>
						<h1 class="medium" data-z data-z-depth="60px" data-z-layers="30">60px</h1>
					</div>
					<div class="split-item">
						<h3><a href="#depth">depth</a><small class="param">CSS length value</small></h3>
						<p>
							The depth of the effect on the z-axis. Accepts any valid CSS length value except
							for %. Default: <code class="light">"1rem"</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Layers -->
			<div class="container option layers-option" id="layers">
				<div class="split">
					<div class="split-item preview">
						<h1 class="large" data-z data-z-layers="10" data-z-depth=".25em">10</h1>
						<h1 class="large" data-z data-z-depth=".5em" data-z-layers="2">2</h1>
					</div>
					<div class="split-item">
						<h3><a href="#layers">layers</a><small class="param">integer</small></h3>
						<p>
							Number of layers that make up the effect. Default:
							<code class="light">10</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Perspective -->
			<div class="container option perspective-option" id="perspective">
				<div class="split">
					<div class="split-item preview vertical">
						<h1 class="small" data-z data-z-perspective="none">none</h1>
						<h1 class="small" data-z data-z-perspective="100px">80px</h1>
						<h1 class="small" data-z data-z-perspective="500px">500px</h1>
					</div>
					<div class="split-item">
						<h3>
							<a href="#perspective">perspective</a>
							<small class="param">CSS length value, "none", or "inherit"</small>
						</h3>
						<p>
							Set distance from the viewer. Default:
							<code class="light">500px</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Fade -->
			<div class="container option fade-option" id="fade">
				<div class="split">
					<div class="split-item preview">
						<h1 class="large" data-z data-z-layers="10" data-z-depth=".25em" data-z-fade="true">
							true
						</h1>
					</div>
					<div class="split-item">
						<h3><a href="#fade">fade</a><small class="param">boolean</small></h3>
						<p>
							Make the text fade away. Default:
							<code class="light">false</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Direction -->
			<div class="container option direction-option" id="direction">
				<div class="split">
					<div class="split-item preview vertical">
						<h1 class="small" data-z data-z-depth=".5em">both</h1>
						<h1 class="small" data-z data-z-depth=".5em" data-z-direction="backwards">backwards</h1>
						<h1 class="small" data-z data-z-depth=".5em" data-z-direction="forwards">forwards</h1>
					</div>
					<div class="split-item">
						<h3>
							<a href="#direction">direction</a>
							<small class="param">"both" | "backwards" | "forwards"</small>
						</h3>
						<p>
							The direction the effect is to be applied. Default:
							<code class="light">"both"</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Event -->
			<div class="container option event-option" id="event">
				<div class="split">
					<div class="split-item preview vertical static">
						<h1 class="medium" data-z data-z-event="none">none</h1>
						<h1 class="medium" data-z data-z-event="pointer">pointer</h1>
						<h1 class="medium" data-z data-z-event="scroll">scroll</h1>
					</div>
					<div class="split-item">
						<h3>
							<a href="#event">event</a>
							<small class="param">"none" | "pointer" | "scroll" | "scrollX" | "scrollY"</small>
						</h3>
						<p>
							Control text rotation with JavaScript. Default:
							<code class="light">"none"</code>
						</p>
						<p>
							This does not override rotations applied with CSS to
							<code class="light">.z-text</code>. It will add to those rotations. This allows
							you to set a start rotation with CSS.
						</p>
						<p>
							<code class="light">"pointer"</code> rotates text in response to the
							<code>mousemove</code> and <code>touchmove</code> events.
						</p>
						<p>
							<code class="light">"scroll"</code> rotates text toward the center of the
							viewport.
						</p>
						<p>
							<code class="light">"scrollX"</code> rotates text toward the horizontal center of
							the viewport.
						</p>
						<p>
							<code class="light">"scrollY"</code> rotates text toward the vertical center of
							the viewport.
						</p>
					</div>
				</div>
			</div>

			<!-- Event Rotation -->
			<div class="container option event-rotation-option" id="eventRotation">
				<div class="split">
					<div class="split-item preview static">
						<h1 class="small" data-z data-z-event="pointer" data-z-eventRotation="20deg">
							20deg
						</h1>
						<h1 class="small" data-z data-z-event="pointer" data-z-eventRotation="60deg">
							60deg
						</h1>
					</div>
					<div class="split-item">
						<h3>
							<a href="#eventRotation">eventRotation</a>
							<small class="param">CSS rotation value</small>
						</h3>
						<p>
							With the <code class="light">event</code> option enabled, set the maximum rotation
							to be applied. Default: <code class="light">"30deg"</code>
						</p>
					</div>
				</div>
			</div>

			<!-- Event Direction -->
			<div class="container option event-direction-option" id="eventDirection">
				<div class="split">
					<div class="split-item preview static vertical">
						<h1 class="medium" data-z data-z-event="pointer">default</h1>
						<h1 class="medium" data-z data-z-event="pointer" data-z-eventDirection="reverse">
							reverse
						</h1>
					</div>
					<div class="split-item">
						<h3>
							<a href="#eventDirection">eventDirection</a>
							<small class="param">"default" | "reverse"</small>
						</h3>
						<p>
							With the <code class="light">event</code> option enabled, choose whether the
							rotation faces toward the target point (default) or away from it (reverse).
							Default: <code class="light">"default"</code>
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<!-- Footer -->
<footer class="footer">
	<div class="wrapper">
		<div class="container">&copy; 2021 Bennett Feely</div>
	</div>
</footer>
