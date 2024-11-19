<script lang="ts">
	import { onMount } from 'svelte';
	import WordCloud from './Wordcloud.svelte';
	import Credit from '$lib/Credit.svelte';

	let words: { text: string; count: number }[] = [];

	const wordCounts = new Map<string, number>();

	let posts = 0;

	let countdown = 3;

	let firstCountdown = true;

	let width: number;
	let height: number;

	const fillerWords = new Set([
		'a',
		'an',
		'the',
		'and',
		'or',
		'but',
		'if',
		'then',
		'so',
		'because',
		'as',
		'of',
		'at',
		'by',
		'for',
		'with',
		'about',
		'against',
		'between',
		'into',
		'through',
		'during',
		'before',
		'after',
		'above',
		'below',
		'to',
		'from',
		'up',
		'down',
		'in',
		'out',
		'on',
		'off',
		'over',
		'under',
		'again',
		'further',
		'then',
		'once',
		'here',
		'there',
		'when',
		'where',
		'why',
		'how',
		'all',
		'any',
		'both',
		'each',
		'few',
		'more',
		'most',
		'other',
		'some',
		'such',
		'no',
		'nor',
		'not',
		'only',
		'own',
		'same',
		'so',
		'than',
		'too',
		'very',
		's',
		't',
		'can',
		'will',
		'just',
		'don',
		'should',
		'now',
		'i',
		'me',
		'my',
		'myself',
		'we',
		'our',
		'ours',
		'ourselves',
		'you',
		'your',
		'yours',
		'yourself',
		'yourselves',
		'he',
		'him',
		'his',
		'himself',
		'she',
		'her',
		'hers',
		'herself',
		'it',
		'its',
		'itself',
		'they',
		'them',
		'their',
		'theirs',
		'themselves',
		'what',
		'which',
		'who',
		'whom',
		'this',
		'that',
		'these',
		'those',
		'am',
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'being',
		'have',
		'has',
		'had',
		'having',
		'do',
		'does',
		'did',
		'doing',
		'a',
		'an',
		'the',
		'and',
		'or',
		'but',
		'if',
		'then',
		'else',
		'because',
		'as',
		'of',
		'at',
		'by',
		'for',
		'with',
		'about',
		'against',
		'between',
		'into',
		'through',
		'during',
		'before',
		'after',
		'above',
		'below',
		'to',
		'from',
		'up',
		'down',
		'in',
		'out',
		'on',
		'off',
		'over',
		'under',
		'again',
		'further',
		'then',
		'once',
		'here',
		'there',
		'when',
		'where',
		'why',
		'how',
		'all',
		'any',
		'both',
		'each',
		'few',
		'more',
		'most',
		'other',
		'some',
		'such',
		'no',
		'nor',
		'not',
		'only',
		'own',
		'same',
		'so',
		'than',
		'too',
		'very',
		's',
		't',
		'can',
		'will',
		'just',
		'don',
		'should',
		'now'
	]);

	onMount(() => {
		function updateDimensions() {
			width = window.innerWidth;
			height = window.innerHeight;
		}

		updateDimensions();

		setTimeout(() => {
			updateWords();
			setInterval(updateWords, 10000);
		}, 3000);

		let countdownInterval = setInterval(() => {
			countdown--;

			if (countdown === 0) {
				firstCountdown = false;
				countdown = 10;
			}
		}, 1000);

		window.addEventListener('resize', updateDimensions);

		function secondsToMicroseconds(seconds: number) {
			return Math.floor(seconds * 1000000);
		}

		const startTime = Date.now() * 1000 - secondsToMicroseconds(10);
		console.log(startTime);

		// WebSocket URL from BlueSky
		const url =
			'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&cursor=' +
			startTime;

		// WebSocket logic
		const ws = new WebSocket(url);
		ws.onopen = () => {
			console.log('Connected to BlueSky WebSocket');
		};

		ws.onmessage = (event) => {
			const json = JSON.parse(event.data);

			if (
				json.kind === 'commit' &&
				json.commit.collection === 'app.bsky.feed.post' &&
				json.commit.operation === 'create' &&
				json.commit.record.text &&
				(!json.commit.record.langs || json.commit.record.langs.includes('en'))
			) {
				// get text of post
				const text: string = json.commit.record.text;

				// split text into words (split by whitespace, newlines, punctuation)
				const words = text.split(/[\s\n\.,!?;]+/);

				words.forEach((word) => {
					// skip words that are empty or not alphanumeric
					if (!word || !word.match(/^[a-zA-Z]+$/) || fillerWords.has(word.toLowerCase())) {
						return;
					}
					// turn to lowercase
					word = word.toLowerCase();

					wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
				});

				posts++;
			}
		};

		return () => {
			ws.close();
			window.removeEventListener('resize', updateDimensions);

			clearInterval(countdownInterval);
		};
	});

	function updateWords() {
		// get 200 most common words
		const mostCommonWords = Array.from(wordCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 200);

		words = mostCommonWords.map(([text, count]) => ({ text, count }));

		// clear wordCounts
		wordCounts.clear();
	}
</script>

<div class="flex h-screen w-screen items-center justify-center overflow-hidden">
	{#if width && height}
		<WordCloud {words} {width} {height} backgroundColor={"#030712"} />
	{/if}
</div>

{#if countdown > 0 && firstCountdown}
	<div class="absolute inset-0 flex h-full w-full items-center justify-center text-8xl font-bold text-gray-50">
		{countdown}
	</div>
{/if}

<div
	class="absolute bottom-0 left-0 right-0 flex w-full justify-center bg-gray-950 text-gray-50 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
>
	<div>
		{#if countdown > 0 && firstCountdown}
			collecting posts and counting words...
		{:else}
			showing most common words of the last 10 seconds excluding filler words, update in {countdown}...
		{/if}
	</div>
</div>

<Credit name="wordcloud" />

<style>
	div {
		overflow: hidden;
	}
</style>
