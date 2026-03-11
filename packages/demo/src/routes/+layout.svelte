<script>
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>ztext.js — 3D Typography for the Web</title>
	<meta name="description" content="Easy to implement, 3D typography for the web. Works with every font." />
	<meta property="og:title" content="ztext.js — 3D Typography for the Web" />
	<meta property="og:description" content="Easy to implement, 3D typography for the web. Works with every font." />
</svelte:head>

{@render children()}
