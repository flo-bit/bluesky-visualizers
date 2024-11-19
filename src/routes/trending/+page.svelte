<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { relativeTime } from 'svelte-relative-time';

	import { gsap } from 'gsap';

	import { Flip } from 'gsap/Flip';
	import { tick } from 'svelte';
	import Credit from '$lib/Credit.svelte';

	gsap.registerPlugin(Flip);

	let wordCounts = new Map<string, number>();
	let posts = 0;

	let lastUpdatePostTime = 0;
	let lastUpdateTime = 0;

	let mostPopularHashtags: [string, number][] = [];

	let startTime = 0;

	let language = 'en';

	function secondsToMicroseconds(seconds: number) {
			return Math.floor(seconds * 1000000);
		}

	let ws: WebSocket;

	function connect() {
		
		startTime = Date.now() * 1000 - secondsToMicroseconds(60 * 60);

		// WebSocket URL from BlueSky
		const url =
			'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&cursor=' +
			startTime;

		// WebSocket logic
		const ws = new WebSocket(url);

		ws.onmessage = onEvent;
	}

	onMount(() => {
		connect();
	});

	onDestroy(() => {
		if(ws) ws.close();
	});

	function onEvent(event: MessageEvent) {
		const json = JSON.parse(event.data);

		// console.log(json);
		if (
			json.kind === 'commit' &&
			json.commit.collection === 'app.bsky.feed.post' &&
			json.commit.operation === 'create' &&
			json.commit.record.text &&
			(json.commit.record.langs?.includes(language) || (language === 'en' && !json.commit.record.langs))
		) {
			// get text of post
			const text: string = json.commit.record.text;

			// check if text contains #
			if (!text.includes('#')) {
				// console.log(json);
				return;
			}

			// find all hashtags
			const hashtags = text.match(/#(\w+)/g);

			hashtags?.forEach((hashtag) => {
				hashtag = hashtag.toLowerCase();
				wordCounts.set(hashtag, (wordCounts.get(hashtag) || 0) + 1);
			});

			// check if we're up to date

			const postTime = json.time_us;
			if (Date.now() > lastUpdateTime + 5000 && posts > 100) {
				lastUpdateTime = Date.now();

				// update last update time
				lastUpdatePostTime = postTime;

				// get most popular hashtags
				update();
			}

			posts++;
		}
	}

	async function update() {
		const state = Flip.getState('.item', {
			props: 'opacity,y'
		});


		mostPopularHashtags = getMostPopularHashtags(15);

		await tick();

		Flip.from(state, {
			duration: 0.5,
			ease: 'power3.inOut',
			onEnter: (el) => {
				gsap.from(el, { opacity: 0, y: 20, duration: 0.5 });
			},
			onExit: (el: HTMLElement) => {
				gsap.to(el, { opacity: 0, y: -20, duration: 0.5 });
			}
		});
	}

	function getMostPopularHashtags(num: number) {
		// get num most popular hashtags with counts
		const mostPopular = Array.from(wordCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, num);
		return mostPopular;
	}

	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'zh', label: 'Chinese (Mandarin)' },
		{ value: 'es', label: 'Spanish' },
		{ value: 'hi', label: 'Hindi' },
		{ value: 'ar', label: 'Arabic' },
		{ value: 'bn', label: 'Bengali' },
		{ value: 'fr', label: 'French' },
		{ value: 'ru', label: 'Russian' },
		{ value: 'pt', label: 'Portuguese' },
		{ value: 'ur', label: 'Urdu' },
		{ value: 'id', label: 'Indonesian' },
		{ value: 'de', label: 'German' },
		{ value: 'ja', label: 'Japanese' },
		{ value: 'sw', label: 'Swahili' },
		{ value: 'mr', label: 'Marathi' },
		{ value: 'te', label: 'Telugu' },
		{ value: 'ta', label: 'Tamil' },
		{ value: 'tr', label: 'Turkish' },
		{ value: 'ko', label: 'Korean' },
		{ value: 'vi', label: 'Vietnamese' }
	];

	let open = false;
	let value = '';

	$: selectedValue = languages.find((f) => f.value === value)?.label ?? 'Select a language...';

	$: if (selectedValue !== 'Select a language...') {
		language = value;

		wordCounts = new Map<string, number>();

		update();
	}

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<div class="absolute left-0 top-0 flex w-full items-center justify-between px-4 py-2">
	<Credit name="trending hashtags" />
</div>

<div class="mx-auto max-w-xl px-4 py-24 text-white">
	<div class="flex items-center gap-2 text-2xl font-bold">
		Most Popular Hashtags on <svg
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
	<div class="mt-2 text-sm text-gray-400">
		{#if lastUpdatePostTime > 0}
			of all posts between <span use:relativeTime={{ date: startTime / 1000 }}></span> and
			<span use:relativeTime={{ date: lastUpdatePostTime / 1000 }}></span>. analysing more...
		{:else}
			analysing posts...
		{/if}
	</div>

	<Popover.Root bind:open let:ids>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="mt-2 w-[200px] justify-between border-gray-800 bg-gray-900 hover:bg-gray-800 hover:text-cyan-400 hover:border-gray-700"
			>
				{selectedValue}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="max-h-[60vh] w-[200px] overflow-y-auto border-gray-800 p-0">
			<Command.Root class="bg-gray-900">
				<Command.Input placeholder="Select language..." class="text-cyan-400 placeholder:" />
				<Command.Empty class="text-gray-400">No framework found.</Command.Empty>
				<Command.Group>
					{#each languages as language}
						<Command.Item
							value={language.label}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger);
							}}
							class="text-gray-200 aria-selected:bg-gray-800 aria-selected:text-cyan-400"
						>
							<Check class={cn('mr-2 h-4 w-4', value !== language.value && 'text-transparent')} />
							{language.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	<div class="mt-8">
		{#if mostPopularHashtags.length === 0}
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto mt-16 size-16 text-cyan-400"
				fill="currentColor"
				><style>
					.spinner_b2T7 {
						animation: spinner_xe7Q 0.8s linear infinite;
					}
					.spinner_YRVV {
						animation-delay: -0.65s;
					}
					.spinner_c9oY {
						animation-delay: -0.5s;
					}
					@keyframes spinner_xe7Q {
						93.75%,
						100% {
							r: 3px;
						}
						46.875% {
							r: 0.2px;
						}
					}
				</style><circle class="spinner_b2T7" cx="4" cy="12" r="3" /><circle
					class="spinner_b2T7 spinner_YRVV"
					cx="12"
					cy="12"
					r="3"
				/><circle class="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3" /></svg
			>
		{/if}
		{#each mostPopularHashtags as hashtag}
			<a
				href={'https://bsky.app/hashtag/' + hashtag[0].split('#')[1]}
				target="_blank"
				class="item group mb-2 flex w-fit items-baseline rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-lg font-semibold"
				data-flip-id={hashtag[0]}
			>
				<span class="text-cyan-100 transition-colors duration-150 group-hover:text-cyan-400"
					>{hashtag[0]}</span
				>
				<span class="ml-2 text-xs text-gray-200">({hashtag[1]}x)</span>
			</a>
		{/each}
	</div>
</div>
