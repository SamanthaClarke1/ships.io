class BlackHole extends Actor {
	constructor(
		id,
		pid,
		pos = new Victor(200, 200),
		vel = 0.5,
		mode = "client",
		ang = 0,
		framelife = opts.BLACKHOLE_READYUP_TIME,
		size = new Victor(opts.BLACKHOLE_DEFAULT_SIZE, opts.BLACKHOLE_DEFAULT_SIZE),
		accel = 1.4,
		velCap = 8,
		turnSpeed = 0.25,
		brakeSpeed = 0.1,
		attraction = new Victor(0, 0),
		obeysBoundarys = true,
		image = "#332233", 
		weight = 6.5
	) {
		super(id, pos, mode, size, vel, ang, accel, velCap, turnSpeed, brakeSpeed, 
			attraction, obeysBoundarys, "bh", image, weight);
		this.framelife = framelife;
		this.ogframelife = framelife;
		this.pid = pid;

		this.drawingFrame = 0;
		this.frameRange = 1;
		this.frameRate = 0.034;
	}

	attract(sea) {
		for(let i in sea.actors) {
			if(!sea.actors[i].isInvis && sea.actors[i].id != this.id) {
				let tactor = sea.actors[i];
				let tdist = Math.max(this.pos.distance(tactor.pos) + 1, opts.MIN_ATTRACT_STRENGTH_DIST);
				if(tdist < opts.MIN_ATTRACT_DIST) {
					let tmass = tactor.mass;
					let attractionStrength = 1/tdist * this.mass * opts.BLACKHOLE_STRENGTH / tmass;
					let vecTo = new Victor(0, 1).rotate(angleBetweenVectors(tactor.pos, this.pos)+Math.PI/2)
									.multiply(new Victor(attractionStrength, attractionStrength));
					tactor.attractionBuffer.add(vecTo);
				}
			}
		}
	}

	merge(sea) {
		if(this.mass < opts.BLACKHOLE_MIN_MASS) {
			sea.removeActorById(this.id);
		} else {
			for(let i in sea.actors) {
				if(sea.actors[i].id != this.id && (sea.actors[i].type == "ship" || this.mass < sea.actors[i].mass)) {
					if(sea.actors[i].isTouchingActor(this)) {
						if(sea.actors[i].type == "bh") {
							if(sea.actors[i].framelife <= 0) {
								sea.actors[i].mass += this.mass;
								let nforce = sea.actors[i].force.add(this.force);
								sea.actors[i].vel = nforce.length();
								sea.actors[i].ang = nforce.angle()-Math.PI/2;
								sea.removeActorById(this.id);
							}
						} else if(sea.actors[i].type == "ship") {
							if(!sea.actors[i].isInvis && sea.actors[i].respawnTimer <= 0) {
								let ownerPlayer = sea.getActorById(this.pid);
								if(ownerPlayer && this.pid != sea.actors[i].pid) { // if the owner of this blackhole isnt the same person whos dying (a person killing themself)
									ownerPlayer.score += 5;
									if(ownerPlayer.type == "ship") ownerPlayer.giveInvisJump(1);
								}

								sea.actors[i].kill(sea);
								sea.actors[i].invisJumps = 1;
							}
						}
					}
				}
			}
		}
	}

	exportState() {
		let state = super.exportState();
		state.framelife = this.framelife;
		state.pid = this.pid;
		return state;
	}

	importState(state) {
		super.importState(state);
		this.framelife = state.framelife;
		this.pid = state.pid;
	}

	update(sea) {
		super.update(sea);

		if(this.framelife <= 0) {
			super.brake();
			this.attract(sea);
		}
		this.mass -= ((this.mass * opts.HAWKING_RADIATION) + opts.FLAT_RADIATION) * opts.TIMESTEP;
		
		this.drawingFrame += this.frameRate * opts.TIMESTEP;
		this.drawingFrame %= this.frameRange;

		this.frameRate = 0.003 * this.radius;
	}

	post_update(sea) {
		super.post_update(sea);

		if(this.framelife > 0) this.framelife -= 1 * opts.TIMESTEP;
		else {
			this.merge(sea);
		}
	}

	draw(ctx, cam) {
		let auraSize = this.radius * 3;
		if(this.framelife > 1) {
			ctx.globalAlpha = Math.max((this.ogframelife-this.framelife),6)/this.ogframelife;

			ctx.strokeStyle = "#32365f";
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, auraSize, 0, Math.PI*2*((this.ogframelife-this.framelife)/this.ogframelife));
			ctx.stroke();
		}
		super.draw(ctx, cam);
		if(this.framelife <= 0) {
			ctx.strokeStyle = "#32365f90";
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, auraSize * (1-this.drawingFrame) + this.radius, 0, Math.PI*2);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
}