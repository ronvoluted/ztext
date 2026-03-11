<script>
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>ztext.js — 3D Typography for the Web</title>
	<meta name="description" content="Easy to implement, 3D typography for the web. Works with every font." />
	<meta property="og:title" content="ztext.js — 3D Typography for the Web" />
	<meta property="og:description" content="Easy to implement, 3D typography for the web. Works with every font." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Cousine&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
