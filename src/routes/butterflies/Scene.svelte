<script>
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Butterfly from './Butterfly.svelte';
	import { onMount } from 'svelte';
	import CustomRenderer from './CustomRenderer.svelte';
	import * as THREE from 'three';

	let userCount = 10;

	let { scene } = useThrelte();

	onMount(() => {
		scene.fog = new THREE.Fog(0, 10, 20);

		const url =
			'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.actor.profile';

		// WebSocket logic
		const ws = new WebSocket(url);
		ws.onopen = () => {
			console.log('Connected to BlueSky WebSocket');
		};

		ws.onmessage = (event) => {
			const json = JSON.parse(event.data);

			if (json.kind !== 'commit') return;

			if (
				json.commit.collection === 'app.bsky.actor.profile' &&
				json.commit.operation === 'create'
			) {
				userCount++;
			}
		};

		return () => {
			ws.close();
		};
	});
</script>

<T.PerspectiveCamera makeDefault position={[1, 0, 0]} far={100}>
	<OrbitControls 
	enableZoom={false}
	enablePan={false}></OrbitControls>
	<!-- <OrbitControls
		autoRotate
		autoRotateSpeed={0.2}
		target={[0, 21, 0]}
		enableZoom={false}
		enablePan={false}
	></OrbitControls> -->
</T.PerspectiveCamera>

<Butterfly count={userCount} />

<T.DirectionalLight position={[0, 0, -10]} intensity={2} />

<T.AmbientLight intensity={1} />

<!-- <Environment files={"/bluesky-visualizers/planet/sky2.hdr"} isBackground /> -->

<CustomRenderer />
