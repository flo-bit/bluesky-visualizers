<script>

	import Credit from "$lib/Credit.svelte";

</script>
<Credit showAll={false} />

<div class="">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
	  <div class="sm:flex sm:items-baseline sm:justify-between">
		<h2 class="text-2xl font-bold tracking-tight text-gray-50">Bluesky Visualizers</h2>
		
	  </div>
  
	  <div class="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
		<div class="group relative aspect-[2/1] overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square border border-gray-900">
		  <img src="/bluesky-visualizers/trending.webp" alt="" class="absolute size-full object-cover group-hover:opacity-75 transition-opacity duration-75">
		  <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
		  <div class="absolute inset-0 flex items-end p-6">
			<div>
			  <h3 class="font-semibold text-white">
				<a href="/bluesky-visualizers/trending">
				  <span class="absolute inset-0"></span>
				  Trending Hashtags
				</a>
			  </h3>
			</div>
		  </div>
		</div>
		<div class="group relative aspect-[2/1] overflow-hidden rounded-lg sm:aspect-auto border border-gray-900">
		  <img src="/bluesky-visualizers/wordcloud.webp" alt="" class="absolute size-full object-cover group-hover:opacity-75 transition-opacity duration-75">
		  <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
		  <div class="absolute inset-0 flex items-end p-6">
			<div>
			  <h3 class="font-semibold text-white">
				<a href="/bluesky-visualizers/wordcloud">
				  <span class="absolute inset-0"></span>
				  Wordcloud
				</a>
			  </h3>
			</div>
		  </div>
		</div>
		<div class="group relative aspect-[2/1] overflow-hidden rounded-lg sm:aspect-auto border border-gray-900">
		  <img src="/bluesky-visualizers/particles.webp" alt="" class="absolute size-full object-cover group-hover:opacity-75 transition-opacity duration-75">
		  <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
		  <div class="absolute inset-0 flex items-end p-6">
			<div>
			  <h3 class="font-semibold text-white">
				<a href="/bluesky-visualizers/particles">
				  <span class="absolute inset-0"></span>
				  Particles
				</a>
			  </h3>
			</div>
		  </div>
		</div>
	  </div>
  
	  <div class="mt-6 sm:hidden">
		<a href="#" class="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
		  Browse all categories
		  <span aria-hidden="true"> &rarr;</span>
		</a>
	  </div>
	</div>
  </div>
  