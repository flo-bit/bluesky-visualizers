import * as THREE from 'three';

export class Butterfly {
	color: THREE.Color;
	position: THREE.Vector3;
	direction: THREE.Vector3;

	morphTime: number = 0;
	morph: number = 0;
	height: number = 0;

	matrix: THREE.Matrix4;
	forward: THREE.Vector3;
	up: THREE.Vector3;

	scale: number;

	constructor(
		color: THREE.Color,
		position: THREE.Vector3,
		matrix: THREE.Matrix4,
		forward: THREE.Vector3,
		up: THREE.Vector3
	) {
		this.color = color;
		this.position = position;
		this.matrix = matrix;
		this.forward = forward;
		this.up = up;

		this.morphTime = Math.random();
		this.direction = new THREE.Vector3(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		).normalize();

		this.scale = Math.random() * 0.4 + 0.4;
		this.height = Math.random();
	}

	update(deltaTime: number) {
		this.morphTime += deltaTime;

		this.morph = Math.sin(this.morphTime * 10) * 0.5 + 0.5;

		this.position.x += this.direction.x * deltaTime * 10;
		this.position.y += this.direction.y * deltaTime * 10;
		this.position.z += this.direction.z * deltaTime * 10;

		this.position.setLength(10 + this.height);
	}
}
