<script lang="ts">
	import { onMount } from 'svelte';
	import emotionLexicon from './emotion_lexicon.json';
	import Credit from '$lib/Credit.svelte';

	let lexicon: Record<string, string[]> = emotionLexicon;

	function tokenize(text: string) {
		// Simple tokenizer that converts text to lowercase and splits on non-word characters
		return text.toLowerCase().match(/\b\w+\b/g);
	}

	function analyzeEmotion(tweet: string) {
		const words = tokenize(tweet);
		const emotions: Record<string, number> = {};

		if (!words) return {};
		words.forEach((word: string) => {
			if (lexicon[word]) {
				lexicon[word].forEach((emotion) => {
					emotions[emotion] = (emotions[emotion] || 0) + 1;
				});
			}
		});

		return emotions;
	}

	let allEmotions: Record<string, number> = {};

	$: total = Object.values(allEmotions).reduce((acc, curr) => acc + curr, 0) as number;

	let posts = 0;

	const emotionEmojis: Record<string, string> = {
		anger: '😠',
		anticipation: '🤔',
		disgust: '🤢',
		fear: '😨',
		joy: '😊',
		sadness: '😢',
		surprise: '😲',
		trust: '🤝'
	};

	onMount(() => {
		const url =
			'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post';

		// WebSocket logic
		const ws = new WebSocket(url);
		ws.onopen = () => {
			console.log('Connected to BlueSky WebSocket');
		};

		ws.onmessage = (event) => {
			const json = JSON.parse(event.data);
			if (json.kind === 'account') console.log(json);

			if (
				json.kind === 'commit' &&
				json.commit.collection === 'app.bsky.feed.post' &&
				json.commit.operation === 'create' &&
				json.commit.record.text &&
				(json.commit.record.langs?.includes('en') || !json.commit.record.langs)
			) {
				let emotions = analyzeEmotion(json.commit.record.text);
				for (const emotion in emotions) {
					allEmotions[emotion] = (allEmotions[emotion] || 0) + emotions[emotion];
				}

				posts++;
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('WebSocket connection closed');
		};
	});
</script>

{#if total > 10}
	<div class="max-w-4xl mx-auto py-24 px-4">
		<div class="inline-flex items-center gap-2 text-2xl w-full justify-center font-bold text-white">
			realtime emotions on 
			<span class="sr-only">
				BlueSky
			</span>
			<svg
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-40 -40 680 620"
				version="1.1"
				class="size-7 fill-cyan-400"
			>
				<path
					d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
				></path>
			</svg>
		</div>
			<div class="mt-8 flex w-full flex-col gap-2 text-white">
				{#each Object.entries(allEmotions) as [emotion, count]}
					<div class="grid grid-cols-5 items-center gap-2">
						<div class="col-span-1 flex flex-col items-center">
							<span class="text-4xl">{emotionEmojis[emotion]}</span>
							<span class="text-xs font-semibold">{emotion}</span>
						</div>
						<div
							class="relative col-span-4 h-full w-full flex items-center"
						>
						<div class="h-fit w-full  overflow-hidden rounded-2xl border border-cyan-500 relative py-0.5">
							<span class="ml-4 font-semibold text-xs">{Math.floor((count / total) * 100)}%</span>
							<div
								style="width: {(count / total) * 100}%"
								class="absolute bottom-0 left-0 top-0 -z-10 h-full w-full bg-cyan-700"
							></div>
						</div>
						</div>
					</div>
				{/each}
		</div>
		<div class="text-sm text-gray-400 text-end mt-4 max-w-lg ml-auto">
			analyzed {posts} posts,
			 using the <a class="text-cyan-400 hover:text-cyan-500 font-semibold" href="https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm" target="_blank">
			NRC Word-Emotion Association Lexicon</a>, this is not any kind of scientific analysis, just a fun experiment.
		</div>
	</div>
{/if}


<Credit name="emotions" />