<script lang="ts">
	export let name: string = '';

	export let showAll: boolean = true;
</script>

<div class="absolute left-3 right-3 top-2 z-10 flex justify-between items-center gap-4">
	<div
		class="rounded-lg bg-gray-950/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm"
	>
		{#if showAll}
			<a class="ml-2 text-xs sm:text-md text-cyan-400" href="/bluesky-visualizers">see all visualizations</a>
		{/if}
	</div>

	<div
		class="flex items-center gap-2 rounded-lg bg-gray-950/70 px-2 py-1 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-100"
	>
		<div class="text-xs sm:text-md">
			made by
			<a
				href="https://flo-bit.dev"
				class="text-cyan-400 transition-colors duration-100 hover:text-cyan-200"
				target="_blank">flo-bit</a
			>
		</div>

		<a
			class="z-10 text-cyan-400 transition-colors duration-100 hover:text-cyan-200"
			href="https://github.com/flo-bit/bluesky-visualizers"
			target="_blank"
		>
			<span class="sr-only">GitHub Code</span>
			<svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" class="size-6">
				<path
					fill-rule="evenodd"
					d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>

		<a
			href="https://bsky.app/profile/flo-bit.dev"
			target="_blank"
			class="text-cyan-400 transition-colors duration-100 hover:text-cyan-200"
		>
			<span class="sr-only">follow me on bluesky</span>
			<svg
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-40 -40 680 620"
				version="1.1"
				class="size-6"
			>
				<path
					d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
				></path>
			</svg>
		</a>
	</div>
</div>
