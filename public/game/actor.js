/* global Victor */
class Actor {
	constructor(id, pos, size, vel, ang, accel, velCap, turnSpeed, brakeSpeed, obeysBoundarys, type, image, mode = "client") {
		this.id = id;
		this.type = type;
		this.pos = pos;
		this.size = size;
		this.vel = vel;
		this.ang = ang;
		this.friction = 0.01;
		this.image = image;
		this.frameRate = -1;
		this.mode = mode;
		this.accel = accel;
		this.velCap = velCap;
		this.turnSpeed = turnSpeed;
		this.brakeSpeed = brakeSpeed;
		this.obeysBoundarys = obeysBoundarys;
		this.turnResistance = 0;
	}

	exportState() {
		let state = {
			pos: this.pos.toObject(),
			size: this.size.toObject(),
			ang: this.ang,
			vel: this.vel,
			id: this.id,
			type: this.type
		};

		return state;
	}
	
	importState(state) {
		this.pos = Victor.fromObject(state.pos);
		this.size = Victor.fromObject(state.size);
		this.ang = state.ang;
		this.vel = state.vel;
		this.id = state.id;
		this.type = state.type;
	}

	update(sea) {
		this.ang = correctAng(this.ang);
		if (this.vel > 0.1) {
			this.vel = Math.min(this.vel, this.velCap);
			this.vel *= 1 - this.friction;

			this.pos.add(this.force);
			
			if(this.obeysBoundarys) this.bounceAway(new Victor(0,0), sea.size);

			this.turnResistance = 0;
		}
	}

	get force() {
		let force = new Victor(1, 0).rotate(this.ang);
		force.multiply(new Victor(this.vel, this.vel));
		return force;
	}

	bounceAway(topLeft, botRight) {
		if(!vecIsInRange(this.pos.clone().add(this.force), topLeft, botRight)) {
			let shouldTurn = false;
			let turnDir = 1;
			this.ang = correctAng(this.ang);
			if(this.pos.x > botRight.x) if(Math.abs(this.ang - (Math.PI * .5)) > .1) {
				shouldTurn = true; turnDir = closestTurnDirFromAngs(this.ang, Math.PI * .5);}
			if(this.pos.y > botRight.y) if(Math.abs(this.ang - Math.PI) > .1) {
				shouldTurn = true; turnDir = closestTurnDirFromAngs(this.ang, Math.PI);}
			if(this.pos.x <  topLeft.x) if(Math.abs(Math.abs(this.ang) - (-Math.PI * .5)) > .1) {
				shouldTurn = true; turnDir = closestTurnDirFromAngs(this.ang, Math.PI * -.5);}
			if(this.pos.y <  topLeft.y) if(Math.abs(this.ang - 0) > .1) {
				shouldTurn = true; turnDir = closestTurnDirFromAngs(this.ang, 0);}

			if(shouldTurn) {
				this.turnResistance = this.turnSpeed / 2;
				this.ang += this.turnSpeed * turnDir;
			}
			this.vel += 0.1;//stop people completely stopping outside of boundaries
		}
	}

	turn(dir) {
		// -1 for left, +1 for right.
		this.ang += dir * ((this.turnSpeed-this.turnResistance) / ((this.vel + 6) / 4));
	}

	boost() {
		// accelerates the ships velocity.
		this.vel += this.accel / Math.max(this.vel, 1);
	}

	brake() {
		this.vel *= (1-this.brakeSpeed);
	}

	draw(ctx, cam) {
		if (this.image[0] == "#") {
			//TODO rectangle rendering
			ctx.fillStyle = this.image;
			let centerPos = new Victor(this.pos.x, this.pos.y);
			ctx.save();
			ctx.translate(centerPos.x, centerPos.y);
			ctx.rotate(this.ang);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#cecefe";
			ctx.beginPath();
			ctx.moveTo(0, this.size.y / 2);
			ctx.lineTo(this.size.x / 2, -this.size.y / 2);
			ctx.lineTo(0, -this.size.y / 3);
			ctx.lineTo(-this.size.x / 2, -this.size.y / 2);
			ctx.lineTo(0, this.size.y / 2);
			ctx.closePath();
			ctx.stroke();
			//ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
			ctx.restore();
		} else {
			let centerPos = new Victor(this.pos.x, this.pos.y);
			ctx.save();
			ctx.translate(centerPos.x, centerPos.y);ctx.rotate(this.ang);
			ctx.rotate(this.ang);
			drawImage(this.image,0,0)
			ctx.restore();
		}
	}
}
