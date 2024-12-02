<script lang="ts">
	// powered by https://github.com/vasturiano/3d-force-graph

	import { AtpBaseClient } from '@atproto/api';
	import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import Credit from '$lib/Credit.svelte';

	let element: HTMLElement;
	let agent: AtpBaseClient;

	let handle = $state('');

	let loading = $state(false);

	async function loadUser() {
		loading = true;
		const did = await resolveHandle(handle);
		const data = await loadData(did, 250);
		makeGraph(data);
		loading = false;
	}

	async function resolveHandle(handle: string) {
		if (!agent) agent = new AtpBaseClient({ service: 'https://api.bsky.app' });

		const data = await agent.com.atproto.identity.resolveHandle({ handle });
		return data.data.did;
	}

	async function loadData(did: string, limit: number = 100) {
		if (!agent) agent = new AtpBaseClient({ service: 'https://api.bsky.app' });

		const { data: userData }: { data: ProfileViewDetailed } = await agent.app.bsky.actor.getProfile(
			{ actor: did }
		);

		const baseFollows = await getFollows(did, limit);

		const baseFollowsSet = new Set(baseFollows.map((f) => f.handle));

		const edges = [];

		const followsSet = new Map<string, Set<string>>();
		followsSet.set(userData.handle, new Set(baseFollows.map((f) => f.handle)));

		const edgeCount = new Map<string, number>();

		const userInfo = new Map<string, any>();

		const promises = [];
		for (const follow of baseFollows) {
			if (!follow.avatar) continue;

			const promise = (async () => {
				const follows = await getFollows(follow.did, limit);
				for (const follow of follows) {
					followsSet.set(follow.handle, new Set(follows.map((f) => f.handle)));
				}

				edges.push({ source: userData.handle, target: follow.handle });

				userInfo.set(follow.handle, follow);
			})();
			promises.push(promise);
		}

		await Promise.all(promises);

		// go through all follows and create edges
		for (const [handle, follows] of followsSet) {
			edgeCount.set(handle, edgeCount.get(handle) || 0);

			for (const follow of follows) {
				if (followsSet.has(follow) && baseFollowsSet.has(follow)) {
					edges.push({ source: handle, target: follow });
					edgeCount.set(handle, (edgeCount.get(handle) || 0) + 1);
				}
			}
		}

		const nodes = Array.from(baseFollowsSet)
			.filter((h) => {
				if (!userInfo.has(h) || (edgeCount.get(h) ?? 0) < 1) {
					return false;
				}
				return true;
			})
			.map((h, i) => {
				const info = userInfo.get(h);
				return {
					id: info.handle,
					imageURL: info.avatar?.replace('avatar', 'avatar_thumbnail'),
					did: info.did
				};
			});

		nodes.push({
			id: userData.handle,
			imageURL: userData.avatar,
			did: userData.did
		});

		const links = edges.filter(
			(e) => nodes.find((n) => n.id === e.source) && nodes.find((n) => n.id === e.target)
		);

		return { links, nodes };
	}

	async function getFollows(did: string, limit: number = 100) {
		const agent = new AtpBaseClient({ service: 'https://api.bsky.app' });

		let allFollows: any[] = [];
		let cursor: string | undefined = undefined;
		// get all follows of actor
		do {
			const follows = await agent.app.bsky.graph.getFollows({
				actor: did,
				limit: limit < 100 ? limit : 100,
				cursor
			});

			allFollows.push(...follows.data.follows);
			cursor = follows.data.cursor;
		} while (cursor && allFollows.length < limit);

		return allFollows;
	}

	async function makeGraph(data: { links: any[]; nodes: any[] }) {
		const module = await import('3d-force-graph');
		const ForceGraph3D = module.default;

		const CSS2DRenderer = await import('three/examples/jsm/renderers/CSS2DRenderer.js');

		const THREE = await import('three');

		console.log(data.nodes.length);

		let currentDataSet = new Set();

		const currentData = {
			nodes: [data.nodes[0]],
			links: []
		};

		currentDataSet.add(data.nodes[0].id);

		let currentIndex = 1;

		const distance = 300;
		const Graph = ForceGraph3D({
			// @ts-ignore
			extraRenderers: [new CSS2DRenderer.CSS2DRenderer()]
		})(element)
			.nodeThreeObject((node) => {
				const nodeEl = document.createElement('img');
				// @ts-ignore
				nodeEl.src = node.imageURL;
				nodeEl.style.width = '30px';
				nodeEl.style.height = '30px';

				nodeEl.style.borderRadius = '100px';
				nodeEl.style.objectFit = 'cover';
				nodeEl.className = 'node-label';
				nodeEl.style.border = '1px solid black';
				let obj = new CSS2DRenderer.CSS2DObject(nodeEl);

				// add a low poly sphere to the node
				const sphere = new THREE.Mesh(
					new THREE.SphereGeometry(4, 32, 32),
					new THREE.MeshBasicMaterial({visible: false})
				);
				sphere.add(obj);

				return sphere;
			})
			.enableNodeDrag(false)
			.graphData(currentData)
			.nodeLabel((node) => `${node.id}`)
			.onNodeClick((node) => {
				window.open(`https://bsky.app/profile/${node.id}`, '_blank');
			})
			.cameraPosition({ z: distance });

		let interval = setInterval(() => {
			if (currentIndex >= data.nodes.length) {
				clearInterval(interval);
				return;
			}

			currentData.nodes.push(data.nodes[currentIndex]);
			currentDataSet.add(data.nodes[currentIndex].id);

			currentData.links.push(
				...data.links.filter(
					(link) => currentDataSet.has(link.source) && currentDataSet.has(link.target)
				)
			);

			Graph.graphData(currentData);
			currentIndex++;
		}, 10);
		// update function every frame
		// .onEngineTick(() => {
		// 	console.log('tick');
		// 	// make all the nodes face the camera
		// 	let camera = Graph.cameraPosition();
		// 	Graph.scene().traverse((child) => {
		// 		if (child instanceof CSS2DRenderer.CSS2DObject) {
		// 			// Create a Vec3 that holds the label's position
		// 			var start = new THREE.Vector3();
		// 			start.copy(child.position);

		// 			// Create a var that holds the distance to the camera
		// 			var dist = start.distanceTo(camera);

		// 			// Apply falloff, then turn that into the label's scale
		// 			var size = 1 / dist;
		// 			child.scale.set(size, size, size);
		// 		}
		// 	});
		// })

		window.addEventListener('resize', () => {
			Graph.width(window.innerWidth).height(window.innerHeight);
		});
	}
</script>

<Credit />

<div bind:this={element} class="h-full w-full"></div>

<div class="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-16 text-white">
	<p class="my-4 text-sm font-semibold">
		See the connections between the last 150 people you followed (if they followed each other as
		part of their last 150 follows)
	</p>

	<form method="POST" on:submit|preventDefault={loadUser}>
		<label for="handle-input" class="mb-2 block text-lg font-semibold">Enter a handle:</label>
		<input
			id="handle-input"
			bind:value={handle}
			class="block w-full rounded-md border-0 bg-base-900 py-1.5 text-base-900 shadow-sm ring-1 ring-inset ring-base-300 placeholder:text-base-400 focus:ring-2 focus:ring-inset focus:ring-accent-600 dark:text-base-100 dark:ring-base-700 dark:placeholder:text-base-600 dark:focus:ring-accent-500 sm:text-sm/6"
			placeholder="yourname.bsky.social"
			type="text"
			required
		/>

		<button
			type="submit"
			disabled={loading}
			class="mt-4 inline-flex w-full justify-center rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:opacity-50"
		>
			Resolve
		</button>
	</form>

	{#if loading}
		<p class="text-sm font-semibold" aria-live="polite">Loading... please wait</p>
	{/if}
</div>
