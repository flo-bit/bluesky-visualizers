import * as PIXI from 'pixi.js';
import ParticleSystem from './particles';

(async () => {
	let app = new PIXI.Application();

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
		'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&wantedCollections=app.bsky.feed.like&wantedCollections=app.bsky.graph.follow';

	// WebSocket logic
	const ws = new WebSocket(url);
	ws.onopen = () => {
		console.log('Connected to BlueSky WebSocket');
	};

	ws.onmessage = (event) => {
		const json = JSON.parse(event.data);
		if (json.kind === 'account') console.log(json);

		if (json.kind === 'commit') {
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
			}
		} else if (json.kind === 'account' && json.account.active) {
			spawnParticle('user');
		}
	};

	ws.onerror = (error) => {
		console.error('WebSocket error:', error);
	};

	ws.onclose = () => {
		console.log('WebSocket connection closed');
	};
})();
