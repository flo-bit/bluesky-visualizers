<script>
	import { T } from '@threlte/core';
	import { OrbitControls, Sky } from '@threlte/extras';
	import Butterfly from './Butterfly.svelte';
	import Planet from './Planet.svelte';
	import { onMount } from 'svelte';

	let userCount = 0;

	let zoom = 25;
	onMount(() => {
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

		// if window small, set zoom to 10
		if (window.innerWidth < 768) {
			zoom = 50;
		}

		window.addEventListener('resize', () => {
			if (window.innerWidth < 768) {
				zoom = 50;
			} else {
				zoom = 25;
			}
		});

		return () => {
			ws.close();
		};
	});
</script>

<T.PerspectiveCamera makeDefault position={[-zoom, 5, 0]}>
	<!-- <OrbitControls autoRotate autoRotateSpeed={0.2} target={[0, 20, 0]}></OrbitControls> -->
	<OrbitControls
		autoRotate
		autoRotateSpeed={0.2}
		target={[0, 21, 0]}
		enableZoom={false}
		enablePan={false}
	></OrbitControls>
</T.PerspectiveCamera>

<T.Group position={[0, 20, 0]}>
	<Butterfly count={userCount} />
	<Planet />
</T.Group>

<T.DirectionalLight position={[0, 0, -10]} intensity={1} />

<!-- <T.AmbientLight intensity={0.5} /> -->

<Sky elevation={1} />

<!-- <Environment files={"/bluesky-visualizers/planet/sky2.hdr"} isBackground /> -->

<!-- <CustomRenderer /> -->
