import * as THREE from 'three';

import UberNoise from 'uber-noise';

export class Butterfly {
	color: THREE.Color;
	position: THREE.Vector3;
	direction: THREE.Vector3;

	morphTime: number = 0;
	morph: number = 0;
	height: number = 0;

	speed: number = 1;

	scale: number;

	rotation: number = 0;

	static readonly defaultDirection = new THREE.Vector3(0, 0, 1);

	noise: UberNoise;

	constructor(color: THREE.Color, position: THREE.Vector3, direction: THREE.Vector3) {
		this.color = color;
		this.position = position;

		this.morphTime = Math.random();
		this.direction = direction;

		this.scale = Math.random() * 0.4 + 0.4;
		this.speed = Math.random() + 1;
		this.height = Math.random();

		this.rotation = -Butterfly.defaultDirection.angleTo(direction);

		this.noise = new UberNoise({ min: -0.04, max: 0.04, scale: 1 });
	}

	update(deltaTime: number) {
		this.rotation = Butterfly.defaultDirection.angleTo(this.direction);

		this.morphTime += deltaTime;

		this.morph = Math.sin(this.morphTime * 10) * 0.5 + 0.5;

		this.position.x += this.direction.x * deltaTime * this.speed;
		this.position.y +=
			this.direction.y * deltaTime * this.speed +
			Math.sin(this.morphTime * 5) * 0.02 * this.speed * 0.5;
		this.position.z += this.direction.z * deltaTime * this.speed;

		const length = this.position.length();

		if (length > 0.3) {
			this.direction.x +=
				this.noise.get(this.position.x, this.position.y, this.position.z) *
				Math.max(0, 1 - length / 30);
			this.direction.z +=
				this.noise.get(this.position.x, this.position.y, this.position.z) *
				Math.max(0, 1 - length / 30);
		}

		this.direction.normalize();

		if (length > 30) {
			this.reset();
		}
	}

	reset() {
		this.position = new THREE.Vector3().randomDirection();
		this.position.y = 0;
		this.position.setLength(20);
		this.position.y = Math.random() * 20 - 10;

		this.position.x += Math.random() * 2 - 1;
		this.position.z += Math.random() * 2 - 1;

		this.direction = this.position.clone();
		this.direction.y = 0;
		this.direction.normalize();
		this.direction.multiplyScalar(-1);
	}
}
