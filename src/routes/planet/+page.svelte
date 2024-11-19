<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import Credit from '$lib/Credit.svelte';
</script>

<Credit name="planet" />

<div class="h-screen w-screen">
	<Canvas>
		<Scene />
	</Canvas>
</div>
