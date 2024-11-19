<script lang="ts">
	import * as PIXI from 'pixi.js';
import ParticleSystem from './particles';

	import { onDestroy, onMount } from "svelte";
	import Credit from '$lib/Credit.svelte';

	let app: PIXI.Application;
	onMount(async () => {
		app = new PIXI.Application();

	let w = window.innerWidth,
		h = window.innerHeight;

	// set to full screen
	await app.init({
		width: w,
		height: h,
		antialias: true,
		backgroundAlpha: 0
	});
	document.body.appendChild(app.canvas);

	// set canvas to absolute position and full size
	app.canvas.style.position = 'absolute';
	app.canvas.style.width = '100%';
	app.canvas.style.height = '100%';

	const heartParticles = new ParticleSystem('/bluesky-visualizers/particles/heart2.png');
	const postParticles = new ParticleSystem('/bluesky-visualizers/particles/post.png');
	const followParticles = new ParticleSystem('/bluesky-visualizers/particles/follow.png');
	const userParticles = new ParticleSystem('/bluesky-visualizers/particles/user.png');

	app.stage.addChild(followParticles.container);
	app.stage.addChild(heartParticles.container);
	app.stage.addChild(postParticles.container);
	app.stage.addChild(userParticles.container);

	let totalTime = 0;

	function spawnParticle(type: 'heart' | 'post' | 'follow' | 'user') {
		let particleSystem;
		if (type === 'heart') {
			particleSystem = heartParticles;
		} else if (type === 'post') {
			particleSystem = postParticles;
		} else if (type === 'follow') {
			particleSystem = followParticles;
		} else if (type === 'user') {
			particleSystem = userParticles;
		}
		let top = true;
		particleSystem.spawnParticle({
			x: Math.random() * w,
			y: top ? -50 : h + 50,
			size: (Math.pow(Math.random(), 4) * 40 + 10) * (type === 'user' ? 1.5 : 1),
			maxAge: Math.random() * 10 + 4,
			speedY: Math.random() * 150 * (top ? 1 : -1) + 50,
			speedX: Math.random() * 10 - 5
		});
	}

	const visible = {
		heart: true,
		post: true,
		follow: true,
		user: true
	};

	app.ticker.add((ticker) => {
		// get ellapsed time
		const deltaTime = ticker.deltaMS * 0.001;
		totalTime += deltaTime;

		heartParticles.update(deltaTime);
		postParticles.update(deltaTime);
		followParticles.update(deltaTime);
		userParticles.update(deltaTime);
	});

	window.addEventListener('resize', () => {
		w = window.innerWidth;
		h = window.innerHeight;
		app.renderer.resize(w, h);
	});

	// post-button
	const postButton = document.getElementById('post-button');
	postButton?.addEventListener('click', () => {
		visible.post = !visible.post;
		if (visible.post) {
			postParticles.container.visible = true;
			postButton.style.opacity = '1';
		} else {
			postParticles.container.visible = false;
			postButton.style.opacity = '0.4';
		}
	});

	// like-button
	const likeButton = document.getElementById('like-button');
	likeButton?.addEventListener('click', () => {
		visible.heart = !visible.heart;
		if (visible.heart) {
			heartParticles.container.visible = true;
			likeButton.style.opacity = '1';
		} else {
			heartParticles.container.visible = false;
			likeButton.style.opacity = '0.4';
		}
	});

	// follow-button
	const followButton = document.getElementById('follow-button');
	followButton?.addEventListener('click', () => {
		visible.follow = !visible.follow;
		if (visible.follow) {
			followParticles.container.visible = true;
			followButton.style.opacity = '1';
		} else {
			followParticles.container.visible = false;
			followButton.style.opacity = '0.4';
		}
	});

	// user-button
	const userButton = document.getElementById('user-button');
	userButton?.addEventListener('click', () => {
		visible.user = !visible.user;
		if (visible.user) {
			userParticles.container.visible = true;
			// set button opacity to 100%
			userButton.style.opacity = '1';
		} else {
			userParticles.container.visible = false;
			// set button opacity to 50%
			userButton.style.opacity = '0.4';
		}
	});

	const url =
		'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&wantedCollections=app.bsky.feed.like&wantedCollections=app.bsky.graph.follow&wantedCollections=app.bsky.actor.profile';

	// WebSocket logic
	const ws = new WebSocket(url);
	ws.onopen = () => {
		console.log('Connected to BlueSky WebSocket');
	};

	ws.onmessage = (event) => {
		const json = JSON.parse(event.data);

		if (json.kind !== 'commit') return;

		if (json.commit.collection === 'app.bsky.feed.post' && json.commit.operation === 'create') {
			spawnParticle('post');
		} else if (
			json.commit.collection === 'app.bsky.feed.like' &&
			json.commit.operation === 'create'
		) {
			spawnParticle('heart');
		} else if (
			json.commit.collection === 'app.bsky.graph.follow' &&
			json.commit.operation === 'create'
		) {
			spawnParticle('follow');
		} else if (
			json.commit.collection === 'app.bsky.actor.profile' &&
			json.commit.operation === 'create'
		) {
			spawnParticle('user')
		}
	};

	ws.onerror = (error) => {
		console.error('WebSocket error:', error);
	};

	ws.onclose = () => {
		console.log('WebSocket connection closed');
	};
	});

	onDestroy(() => {
		// remove canvas from DOM
		if(!app || !app.canvas) return;
		app.canvas.remove();
		// destroy app
		app.destroy();
	});
</script>

<div class="absolute bottom-2 right-2 z-10 bg-black/90 p-2 rounded-xl">
	<button
	  id="like-button"
	  class="inline-flex gap-1 items-center rounded-full bg-rose-500/10 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-400/30"
	>
	  <svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		class="size-5"
	  >
		<path
		  d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
		/>
	  </svg>

	  new like
	</button>
	<button
	  id="follow-button"
	  class="inline-flex gap-1 items-center rounded-full bg-green-500/10 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/30"
	>
	  <svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		class="size-5"
	  >
		<path
		  d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z"
		/>
	  </svg>

	  new follow
	</button>
	<button
	  id="post-button"
	  class="inline-flex gap-1 items-center rounded-full bg-amber-500/10 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-400/30"
	>
	  <svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		class="size-5"
	  >
		<path
		  fill-rule="evenodd"
		  d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
		  clip-rule="evenodd"
		/>
	  </svg>

	  new post
	</button>
	<button
	  id="user-button"
	  class="inline-flex gap-1 items-center rounded-full bg-sky-500/10 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-sky-400 ring-1 ring-inset ring-sky-400/30"
	>
	  <svg
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="-40 -40 680 620"
		version="1.1"
		class="size-5"
	  >
		<path
		  d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
		></path>
	  </svg>

	  new user
	</button>
  </div>

<Credit name="particles" />