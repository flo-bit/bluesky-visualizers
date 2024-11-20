<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { Butterfly } from './butterfly';

	let geometry: THREE.BufferGeometry;

	let instancedMesh: THREE.InstancedMesh;

	let mesh: THREE.Mesh;

	let numButterflies = 10000;

	let butterflies: Butterfly[] = [];

	export let count = 0;

	function createButterfly(texture: THREE.Texture) {
		geometry = new THREE.PlaneGeometry(2, 2, 2, 2).toNonIndexed();

		const positions = geometry.getAttribute('position');
		console.log(positions);
		const morphPositions = new Float32Array(positions.count * 3);
		const morphNormals = new Float32Array(positions.count * 3);

		geometry.rotateX(-Math.PI / 2 + 0.5);
		let scale = 1;
		geometry.scale(scale, scale, scale);

		let v = new THREE.Vector3();
		for (let i = 0; i < positions.count; i++) {
			v.fromBufferAttribute(positions, i);
			morphPositions[i * 3] = v.x * (scale - Math.abs(v.x) < 0.01 ? 0.1 : 1);
			morphPositions[i * 3 + 1] = v.y;
			morphPositions[i * 3 + 2] = v.z + (scale - Math.abs(v.x) < 0.01 ? scale : 0);
		}

		// calculate morph normals
		for (let i = 0; i < positions.count; i += 3) {
			let a = new THREE.Vector3(
				morphPositions[i * 3],
				morphPositions[i * 3 + 1],
				morphPositions[i * 3 + 2]
			);
			let b = new THREE.Vector3(
				morphPositions[i * 3 + 3],
				morphPositions[i * 3 + 4],
				morphPositions[i * 3 + 5]
			);
			let c = new THREE.Vector3(
				morphPositions[i * 3 + 6],
				morphPositions[i * 3 + 7],
				morphPositions[i * 3 + 8]
			);

			let normal = new THREE.Vector3();
			normal.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();

			morphNormals[i * 3] = normal.x;
			morphNormals[i * 3 + 1] = normal.y;
			morphNormals[i * 3 + 2] = normal.z;

			morphNormals[i * 3 + 3] = normal.x;
			morphNormals[i * 3 + 4] = normal.y;
			morphNormals[i * 3 + 5] = normal.z;

			morphNormals[i * 3 + 6] = normal.x;
			morphNormals[i * 3 + 7] = normal.y;
			morphNormals[i * 3 + 8] = normal.z;
		}

		geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(morphPositions, 3)];
		geometry.morphAttributes.normal = [new THREE.Float32BufferAttribute(morphNormals, 3)];

		mesh = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial({ transparent: true, side: THREE.DoubleSide })
		);
		mesh.morphTargetInfluences = [1];

		let material = new THREE.MeshStandardMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			map: texture,
			alphaTest: 0.9
		});

		instancedMesh = new THREE.InstancedMesh(geometry, material, numButterflies);
		const color = new THREE.Color();
		// set random positions
		const edge = 20;
		let start = new THREE.Vector3(1, 0, 0);
		for (let i = 0; i < numButterflies; i++) {
			let left = Math.random() < 0.5;
			let position = new THREE.Vector3().randomDirection();
			position.y = 0;
			position.setLength(edge);
			position.y = Math.random() * 10 - 5;

			position.x += Math.random() * 2 - 1;
			position.z += Math.random() * 2 - 1;

			let scale = 0.1 + Math.random() * 0.3;

			mesh.scale.set(scale, scale, scale);

			mesh.updateMatrix();

			instancedMesh.setMatrixAt(i, mesh.matrix);

			color.setHSL(Math.random(), 1, 0.5);

			let direction = position.clone();
			direction.y = 0;
			direction.normalize();
			direction.multiplyScalar(-1);

			let butterfly = new Butterfly(color, position, direction);
			butterflies.push(butterfly);
			butterfly.update(0);

			mesh.morphTargetInfluences = [butterfly.morph];
			instancedMesh.setMorphAt(i, mesh);

			instancedMesh.setColorAt(i, butterfly.color);
		}
		instancedMesh.count = count;

		if (instancedMesh.morphTexture) {
			instancedMesh.morphTexture.needsUpdate = true;
		}
	}

	$: if (count && instancedMesh) {
		instancedMesh.count = Math.min(count, numButterflies);
	}

	onMount(async () => {
		const loader = new THREE.TextureLoader();

		loader.load('/bluesky-visualizers/planet/butterfly.png', (texture) => {
			console.log('mask loaded', texture);
			createButterfly(texture);
		});
	});

	useTask((delta) => {
		if (!instancedMesh) return;

		let quaternion = new THREE.Quaternion();
		let initialUp = new THREE.Vector3(0, 0, -1);
		for (let i = 0; i < instancedMesh.count; i++) {
			butterflies[i].update(delta);

			mesh.morphTargetInfluences = [butterflies[i].morph];

			quaternion.setFromUnitVectors(initialUp, butterflies[i].direction);

			mesh.quaternion.copy(quaternion);
			mesh.position.copy(butterflies[i].position);
			mesh.updateMatrix();

			instancedMesh.setMorphAt(i, mesh);
			instancedMesh.setMatrixAt(i, mesh.matrix);
		}

		if (instancedMesh.morphTexture) {
			instancedMesh.morphTexture.needsUpdate = true;
		}
		instancedMesh.instanceMatrix.needsUpdate = true;
	});
</script>

<T is={instancedMesh} />
