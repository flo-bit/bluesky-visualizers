<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import Credit from '$lib/Credit.svelte';
</script>

<Credit name="planet" />

<div class="h-screen w-screen bg-black">
	<Canvas>
		<Scene />
	</Canvas>
</div>

<div class="absolute bottom-1 left-1 right-1 text-center text-white font-semibold text-sm px-2">every butterfly is one new user</div>
