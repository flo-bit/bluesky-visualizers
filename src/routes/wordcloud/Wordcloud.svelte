<script>
	// adopted from https://github.com/maziyank/svelte-d3-cloud
	import { createEventDispatcher } from 'svelte';
	import cloud from 'd3-cloud';
	import { select } from 'd3-selection';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { transition } from 'd3-transition';

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Props
	export let words = [];
	export let width = 800;
	export let height = 500;
	export let font = 'Impact';
	export let maxFontSize = 70;
	export let minFontSize = 20;
	export let minRotate = -10;
	export let maxRotate = -10;
	export let scheme = schemeTableau10;
	export let padding = 5;
	export let backgroundColor = '#fff';

	// Reactive fill scale
	$: fill = scaleOrdinal(scheme);

	// Event handlers
	const onWordClick = (d) => dispatch('click', d);
	const onWordMouseOver = (d) => dispatch('mouseover', d);
	const onWordMouseOut = (d) => dispatch('mouseout', d);
	const onWordMouseMove = (d) => dispatch('mousemove', d);

	// Watch for changes in words and update the cloud
	$: if (words || width || height) {
		updateCloud();
	}

	function updateCloud() {
		if (!words || words.length === 0) {
			// Clear the word cloud if words are empty
			select('#wordcloud').select('svg').remove();
			return;
		}

		const maxWordCount = Math.max(...words.map((d) => d.count));

		const layout = cloud()
			.size([width, height])
			.words(words.map((d) => Object.assign({}, d))) // Clone words to prevent mutation
			.padding(padding)
			.rotate(() => ~~(Math.random() * (maxRotate - minRotate + 1)) + minRotate)
			.font(font)
			.fontSize((d) => Math.max(minFontSize, Math.floor((d.count / maxWordCount) * maxFontSize)))
			.on('end', draw);

		layout.start();
	}

	function draw(words) {
		console.log('Drawing words', words.length);
		let svg = select('#wordcloud').select('svg');

		if (svg.empty()) {
			svg = select('#wordcloud')
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.style('background-color', backgroundColor);

			svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
		} else {
			svg.attr('width', width).attr('height', height).style('background-color', backgroundColor);
		}

		const g = svg.select('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

		const text = g.selectAll('text').data(words, (d) => d.text);

		// EXIT
		text.exit().transition().duration(1000).style('opacity', 0).remove();

		// UPDATE
		text
			.transition()
			.duration(1000)
			.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
			.style('font-size', (d) => d.size + 'px');

		// ENTER
		const textEnter = text
			.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
			.style('font-size', '1px')
			.style('font-family', font)
			.style('fill', (_d, i) => fill(i))
			.text((d) => d.text)
			.on('click', onWordClick)
			.on('mouseover', onWordMouseOver)
			.on('mouseout', onWordMouseOut)
			.on('mousemove', onWordMouseMove);

		textEnter
			.transition()
			.duration(1000)
			.style('font-size', (d) => d.size + 'px');

		// set svg to absolute position, top left
		svg.style('position', 'absolute');
		svg.style('top', '0');
		svg.style('left', '0');
	}
</script>

<div id="wordcloud"></div>

<style>
	div#wordcloud {
		width: fit-content;
		height: fit-content;
	}
</style>
