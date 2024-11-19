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
		for (let i = 0; i < numButterflies; i++) {
			let position = new THREE.Vector3().randomDirection();

			mesh.position.set(0, 1, 0);
			// reset rotation
			mesh.quaternion.identity();
			mesh.up = new THREE.Vector3(0, 0, 1);

			// mesh.rotation.y = Math.random() * Math.PI * 2;

			let { up, forward } = moveMeshOnSphere(mesh, position, Math.random() * Math.PI * 2);
			let scale = 0.1 + Math.random() * 0.3;

			mesh.scale.set(scale, scale, scale);

			mesh.position.setLength(11 + Math.random() * 2);

			mesh.updateMatrix();

			instancedMesh.setMatrixAt(i, mesh.matrix);

			color.setHSL(Math.random(), 1, 0.5);
			let butterfly = new Butterfly(color, position, mesh.matrix.clone(), forward, up);
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

	$: if(count && instancedMesh) {
		instancedMesh.count = Math.min(count, numButterflies);
		console.log('count', instancedMesh.count);
	}

	function moveMeshOnSphere(mesh: THREE.Mesh, p: THREE.Vector3, angle: number) {
		// Normalize the new position to get the new up vector (since the sphere is centered at the origin)
		var newUp = p.clone().normalize();

		// Create a quaternion that rotates from the original up vector to the new up vector
		var quaternion = new THREE.Quaternion();
		var initialUp = new THREE.Vector3(0, 1, 0);
		quaternion.setFromUnitVectors(initialUp, newUp);

		// Apply an additional rotation around the new up axis by the given angle
		var rotationAroundUp = new THREE.Quaternion();
		rotationAroundUp.setFromAxisAngle(newUp, angle);

		// Corrected: Combine the rotations using premultiply
		quaternion.premultiply(rotationAroundUp);

		// Update the mesh's quaternion to apply the rotation
		mesh.quaternion.copy(quaternion);

		// Update the mesh's position
		mesh.position.copy(p);

		// Optionally, update the mesh's up and forward vectors
		var newForward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);

		return { up: newUp, forward: newForward };
	}

	onMount(async () => {
		const loader = new THREE.TextureLoader();

		loader.load('/bluesky-visualizers/planet/butterfly.png', (texture) => {
			console.log('mask loaded', texture);
			createButterfly(texture);
		});
	});

	function moveMatrixForwardOnSphere(
		matrix: THREE.Matrix4,
		forwardVector: THREE.Vector3,
		upVector: THREE.Vector3,
		moveAmount: number,
		rotateAngle: number
	) {
		// Step 1: Rotate the forward vector around the up vector by rotateAngle
		var newForward = forwardVector.clone().applyAxisAngle(upVector, rotateAngle).normalize();

		// Step 2: Compute the right vector (perpendicular to the up and forward vectors)
		var rightVector = newForward.clone().cross(upVector).normalize();

		// Step 3: Compute the rotation angle θ = moveAmount / radius
		var position = new THREE.Vector3();
		position.setFromMatrixPosition(matrix);
		var radius = position.length(); // Assuming sphere is centered at origin
		var theta = moveAmount / radius; // Small angle approximation

		// Step 4: Rotate the position vector around the right vector by angle θ to get the new position
		var newPosition = position.clone().applyAxisAngle(rightVector, theta);

		// Step 5: Compute the new up vector at the new position
		var newUp = newPosition.clone().normalize();

		// Step 6: Rotate the forward vector around the right vector by angle θ to align it with the new position
		newForward.applyAxisAngle(rightVector, theta).normalize();

		// Step 7: Compute the new right vector at the new position
		var newRight = newForward.clone().cross(newUp).normalize();

		// Step 8: Build the rotation matrix from the new basis vectors
		var rotationMatrix = new THREE.Matrix4();
		// Note: In three.js, the local z-axis points backward, so we negate the forward vector
		rotationMatrix.makeBasis(newRight, newUp, newForward.clone().negate());

		// Step 9: Create the new transformation matrix
		var newMatrix = new THREE.Matrix4();
		newMatrix.makeBasis(newRight, newUp, newForward.clone().negate());
		newMatrix.setPosition(newPosition);

		// Step 10: Return the new matrix and the updated up and forward vectors
		return {
			matrix: newMatrix,
			up: newUp,
			forward: newForward
		};
	}

	useTask((delta) => {
		if (!instancedMesh) return;

		let position = new THREE.Vector3(0, 0, 0);
		let scale = new THREE.Vector3(0, 0, 0);
		for (let i = 0; i < instancedMesh.count; i++) {
			butterflies[i].update(delta);
			mesh.morphTargetInfluences = [butterflies[i].morph];
			instancedMesh.setMorphAt(i, mesh);

			let { up, forward, matrix } = moveMatrixForwardOnSphere(
				butterflies[i].matrix,
				butterflies[i].forward,
				butterflies[i].up,
				-0.01,
				0.0
			);

			position.setFromMatrixPosition(matrix);

			position.setLength(10.5 + 0.5 - butterflies[i].morph * 0.5 + butterflies[i].height);

			matrix.setPosition(position);

			scale.setFromMatrixScale(matrix);
			scale.setLength(butterflies[i].scale);
			matrix.scale(scale);

			butterflies[i].up = up;
			butterflies[i].forward = forward;
			butterflies[i].matrix = matrix;
			instancedMesh.setMatrixAt(i, butterflies[i].matrix);
		}

		if (instancedMesh.morphTexture) {
			instancedMesh.morphTexture.needsUpdate = true;
		}
		instancedMesh.instanceMatrix.needsUpdate = true;
	});
</script>

<T is={instancedMesh} />
