<script lang="ts">
	import { onMount } from "svelte";

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<main>
	<header>
		<h1>ztext.js</h1>
		<p>Easy to implement, 3D typography for the web. Works with every font.</p>
	</header>

	<section class="intro">
		<p>
			ztext.js is a lightweight JavaScript library that converts text elements into
			layered 3D typography using CSS transforms. No WebGL, no canvas — just pure
			CSS 3D.
		</p>
	</section>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		padding: 4rem 0;
	}

	h1 {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.intro {
		text-align: center;
		padding: 2rem 0;
	}
</style>
