/* global Victor Actor */
class Ship extends Actor {
	constructor(
		id,
		pos = new Victor(10, 10),
		size = new Victor(30, 30),
		vel = 0.5,
		ang = 0,
		accel = 1.4,
		velCap = 8,
		turnSpeed = 0.25,
		brakeSpeed = 0.125,
		obeysBoundarys = true,
		bulletSpeed = 2.1,
		image = "https://www.w3schools.com/graphics/pic_the_scream.jpg"
	) {
		super(id, pos, size, vel, ang, accel, velCap, turnSpeed, brakeSpeed, obeysBoundarys, "ship", image);
		this.keys = { left: false, right: false, forward: false, backward: false};
		this.bulletSpeed = bulletSpeed;
		this.bullets = [];
	}

	get headVector() {
		return this.pos.clone().add(this.force.multiply(new Victor(3, 3)));
	}

	getBullets() {
		let bpos = this.headVector;

		//TODO: support for spread bullets, etc.

		return bullets;
	}

	exportState() {
		let state = super.exportState();
		state.keys = this.keys;
		state.health = this.health;
		return state;
	}

	importState(state) {
		super.importState(state);
		this.health = state.health;
		this.keys = state.keys;
	}

	setKey(e, tf = true) {
		this.keys = this.retKey(e, tf);
	}

	retKey(e, tf = true) {
		let tkeys = this.keys;
		if (e == 37 || e == 65) tkeys.left = tf;
		if (e == 39 || e == 68) tkeys.right = tf;
		if (e == 38 || e == 87) tkeys.forward = tf;
		if (e == 40 || e == 83) tkeys.backward = tf;
		return tkeys;
	}

	update(sea) {
		//stub
		if (this.keys.left) super.turn(-1);
		if (this.keys.right) super.turn(+1);

		if (this.keys.forward) super.boost();
		if (this.keys.backward) super.brake();

		super.update(sea);
	}

	draw(ctx, cam) {
		//stub
		super.draw(ctx, cam);
	}
}
