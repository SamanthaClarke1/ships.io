/* global Actor Sea Victor $ opts makeSlug io URL Ship */

$(function() {
	let cnv = document.getElementById("main-canv");
	let ctx = cnv.getContext("2d");

	let padding = new Victor(50, 50);
	let desiredSize = Math.min(window.innerHeight - padding.x, window.innerWidth - padding.y);
	$(cnv).attr("width",  desiredSize+"px");
	$(cnv).attr("height", desiredSize+"px");

	let screenDims = new Victor(800, 800);
	let screenScale = new Victor(desiredSize, desiredSize).divide(screenDims);
	console.log("desiredSize", desiredSize, "screenDims", screenDims, "screenScale", screenScale);
	ctx.scale(screenScale.x, screenScale.y);

	let cnvBodyRect = cnv.getBoundingClientRect();

	$("#data-overlay").css("top", cnvBodyRect.top+10).css("left", cnvBodyRect.left-10)
					  .css("width", cnvBodyRect.width+"px").css("height", cnvBodyRect.height+"px");

	let GAME_IS_READY = false;
	let GAME_IS_HIDDEN = false;

	let sea = new Sea();
	const socket = io();
	const mid = makeSlug(6, 6);

	let playerMissingBuffer = 0;
	let framesDrawn = 0;

	let url = new URL(window.location.href);
	let roomNum = url.searchParams.get("room") || -1;
	let name = url.searchParams.get("name") || "";

	function setup() {
		console.log("my player id is: ", mid);
		socket.emit("enter lobby", roomNum, mid, name);

		socket.on("fatalerror", function(err) {
			alert(err);
			GAME_IS_READY = false;
		});

		socket.on("pongoid", function(msg) {
			let latency = Date.now() - msg;
			let player = sea.getActorById(mid);

			$("#game-ping").text(latency);

			if (player) {
				$("#ship-posx").text(Math.floor(player.pos.x * 100) / 100);
				$("#ship-posy").text(Math.floor(player.pos.y * 100) / 100);
				$("#ship-ang").text(Math.floor(player.ang * 100) / 100);
				$("#ship-vel").text(Math.floor(player.vel * 100) / 100);
			}

			setTimeout(function() {
				socket.emit("pingoid", Date.now(), mid);
			}, 500);
		});
		socket.emit("pingoid", Date.now(), mid);

		socket.on("new game", function(data) {
			console.log("connection made to a new game!");

			roomNum = data.seaid;
			sea.importState(data.sea);

			sea.hooks.scoreboard.push(drawScoreboard);

			sea.updateScoreboard();

			GAME_IS_READY = true;
		});

		socket.on("heartbeat", function(data) {
			sea.importState(data);
		});

		function onKeyEv(e, tf) {
			if(tf && e.keyCode == 27) {
				GAME_IS_HIDDEN = !GAME_IS_HIDDEN;
				$(cnv).fadeTo(800, (GAME_IS_HIDDEN ? 0.2 : 1));
			}
			else {
				let player = sea.getActorById(mid);
				sea.keyBuffers[mid] = player.retKey(e.keyCode, tf);
				socket.emit(tf ? "keydown" : "keyup", roomNum, mid, e.keyCode);
			}
		}

		document.addEventListener("keydown", function(e) {
			onKeyEv(e, true);
		});

		document.addEventListener("keyup", function(e) {
			onKeyEv(e, false);
		});
	}
	setup();

	function tick() {
		if (GAME_IS_READY) {
			let player = sea.getActorById(mid);

			if (player) {
				playerMissingBuffer = 0;
				sea.update();
			} else {
				playerMissingBuffer += 1;
				if (playerMissingBuffer >= 10) {
					alert(
						"Couldn't find your player, 10 times in a row. Please refresh your browser, you probably just timed out!"
					);
					GAME_IS_READY = false;
				}
			}
			if (player) {
				sea.post_update();
			}
			//console.log(player.keys);
		}
	}
	let tickFunc = setInterval(tick, Math.floor(1000 / (opts.FPS))); 

	function draw() {
		if (GAME_IS_READY) {
			let player = sea.getActorById(mid);
			let cam = createCamera(player.pos.clone(), screenDims.clone(), sea.size.clone());

			ctx.fillStyle = "#151527";
			ctx.fillRect(0, 0, screenDims.x, screenDims.y);
			ctx.translate(-cam.x, -cam.y);
			sea.draw(ctx, cam);
			ctx.translate(cam.x, cam.y);

			//drawScopes(screenDims, ctx, 4);

			framesDrawn++;
		}
	}
	let drawFunc = setInterval(draw, Math.floor(1000 / opts.FPS));

	function updateFPS() {
		let fps = framesDrawn;
		framesDrawn = 0;
		$("#game-fps").text(fps);
	}
	let updateFPSFunc = setInterval(updateFPS, 1000);

	function drawScoreboard(sb) {
		let htmlToInsert = '';

		for(let i = 0; i < opts.PEOPLE_IN_SCOREBOARD && i < sb.length; i++) {
			htmlToInsert +=`<div class="sb-ship sb-ship-`+sb[i].id+`">
								<span class="sb-ship-name">`+sb[i].name+`</span> 
								<span class="sb-ship-score">`+sb[i].score+`</span> 
							</div>`;
		}

		$('#scoreboard-holder').empty().append(htmlToInsert);
	}
});
