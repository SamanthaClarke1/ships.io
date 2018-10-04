/* global Victor opts */
class SimpleActor{
	constructor(image, pos, ang, size) {
		this.image = image;
		this.ang = ang;
		this.pos = pos;
		this.size = size;
	}

	draw(ctx, cam) {
			if (this.image[0] == "#") {
			ctx.fillStyle = this.image;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, (this.size.x+this.size.y)/2, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fill();
		} else {
			let centerPos = new Victor(this.pos.x, this.pos.y);
			ctx.save();
			ctx.translate(centerPos.x, centerPos.y);
			ctx.rotate(this.ang+toRad(90));
			ctx.drawImage(this.img, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
			ctx.restore();
		}
	}
}

class Actor extends SimpleActor {
	constructor(id, pos, mode, size, vel, ang, accel, velCap, turnSpeed, brakeSpeed, attraction, obeysBoundarys, type, image, weight) {
		super(image, pos, ang, size);
		this.id = id;
		this.type = type;
		this.vel = vel * opts.TIMESTEP;
		this.friction = 0.01 * opts.TIMESTEP;
		this.frameRate = -1;
		this.mode = mode;
		this.accel = accel * opts.TIMESTEP;
		this.velCap = velCap * opts.TIMESTEP;
		this.turnSpeed = turnSpeed;
		this.brakeSpeed = brakeSpeed * opts.TIMESTEP;
		this.obeysBoundarys = obeysBoundarys;
		this.turnResistance = 0;
		this.attraction = attraction;
		this.attractionBuffer = attraction;
		this.weight = weight;

		if(this.mode == "client") {
			var img = new Image();
			if(this.image[0] != "#") img.src = this.image;
			this.img = img;
		}
	}

	isTouchingActor(otherActor) {
		return (this.pos.distanceSq(otherActor.pos) < Math.pow(this.radius + otherActor.radius, 2));
	}

	get radius() {
		return (this.size.x + this.size.y) / 4;
	}

	get headVector() {
		return new Victor(0, this.radius).rotate(this.ang).add(this.pos.clone());
	}

	get mass() {
		return this.size.x*this.size.y*this.weight;
	}

	set mass(m) {
		let tt = Math.sqrt(m/this.weight);
		this.size.x = tt;
		this.size.y = tt;
	}

	exportState() {
		let state = {
			pos: this.pos.toObject(),
			size: this.size.toObject(),
			ang: this.ang,
			vel: this.vel,
			id: this.id,
			type: this.type,
			attraction: this.attraction
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
		this.attraction = Victor.fromObject(state.attraction);
	}
	
	update(sea) {
		this.ang = correctAng(this.ang);
		if (this.vel > 0.1) {
			this.vel = Math.min(this.vel, this.velCap);
			this.vel *= 1 - this.friction;
			if(this.turnResistance > 1) console.log(this.turnResistance);
		}
		if(this.obeysBoundarys) this.bounceAway(new Victor(0,0), sea.size);

		let extraTurn = this.force.clone().normalize().dot(this.attraction.clone().rotateBy(Math.PI / 2));
		extraTurn = Math.abs(extraTurn) / Math.max(this.turnResistance, 1);

		this.ang += this.makeTurn(this.attraction.angle() - Math.PI / 2, 0.05, 
								  this.attraction.length()) * (this.turnSpeed/24) * (extraTurn+2);
		
		this.pos.add(this.attraction);
		
		if(this.vel > 0.1) {
			this.pos.add(this.force);
		}
	}

	post_update(sea) {
		this.turnResistance = 0;
		this.attraction = this.attractionBuffer;
		this.attractionBuffer = new Victor(0, 0);
	}

	get force() {
		let force = new Victor(0, 1).rotate(this.ang);
		force.multiply(new Victor(this.vel, this.vel));
		return force;
	}

	makeTurn(tang, deadzone=0.1, mag=1) {
		let turnDir = 0;
		if(Math.abs(this.ang - tang) > deadzone) {
			turnDir = closestTurnDirFromAngs(this.ang, tang);
		}
		return turnDir * mag;
	}

	bounceAway(topLeft, botRight) {
		if(!vecIsInRange(this.pos.clone().add(this.force), topLeft, botRight)) {
			let turnDir = 0;
			this.ang = correctAng(this.ang);

			if(this.pos.x > botRight.x) turnDir += this.makeTurn( Math.PI * .5);
			else if(this.pos.y > botRight.y) turnDir += this.makeTurn( Math.PI     );
			else if(this.pos.x <  topLeft.x) turnDir += this.makeTurn(-Math.PI * .5);
			else if(this.pos.y <  topLeft.y) turnDir += this.makeTurn( 0           );

			if(turnDir != 0) {
				this.turnResistance = 5;
				this.ang += this.turnSpeed * turnDir * opts.TIMESTEP;

				let attrToCenter = this.pos.clone().subtract(botRight.clone().multiply(new Victor(0.5, 0.5))).normalize().multiply(new Victor(-1, -1));
				this.attractionBuffer.add(attrToCenter.multiply(new Victor(this.vel/1.3, this.vel/1.3)));
			}
			this.vel += 0.08*opts.TIMESTEP;//stop people completely stopping outside of boundaries
		}
	}

	turn(dir) {
		// -1 for left, +1 for right.
		this.ang += dir * (this.turnSpeed/Math.max(this.turnResistance,1));
	}

	boost() {
		// accelerates the ships velocity.
		this.vel += this.accel / Math.max(this.vel * opts.VEL_CAPPER, 1);
	}

	brake() {
		this.vel *= (1-this.brakeSpeed);
	}

	draw(ctx, cam) {
		super.draw(ctx,cam);
	}
}
