<script lang="ts">
    import { T } from "@threlte/core";
	import { Planet } from "./worlds/planet";

    import { useSuspense } from '@threlte/extras'
	import { planetPresets } from "./worlds/presets";
    const suspend = useSuspense()

    let presets = ['forest', 'beach', 'snowForest'];

    let preset = planetPresets['forest'];
    preset.atmosphere = { enabled: false };
    let planet = new Planet(preset);
    let planetMesh = suspend(planet.create());
    
    export const redo = async () => {
        planet = new Planet(planetPresets[presets[Math.floor(Math.random() * presets.length)]]);
        planetMesh = planet.create();
    }
</script>

{#await planetMesh then mesh}
  <T is={mesh} scale={10}/>
{/await}