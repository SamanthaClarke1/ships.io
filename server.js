const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

require("dotenv").config();

const Victor = require("victor");
const gm = require("./build/out.js");

const SEAS_LIMIT = gm.opts.SEAS_LIMIT;
const FPS = gm.opts.FPS;
const TICKFREQ = Math.floor(1000 / FPS);

let seas = [];

app.use(express.static("public"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/views/menu.html");
});

app.get("/game", function(req, res) {
	res.sendFile(__dirname + "/views/index.html");
});

app.use(express.static('res'));

let lastPings = {};
let playersSeas = {};

function removePlayer(pid) {
	let tsea = seas[playersSeas[pid]];
	if (tsea) {
		tsea.removeActorById(pid);
		console.log(tsea.players + " players are logged in right now.");
	}
	delete playersSeas[pid];
	delete lastPings[pid];
}

function checkPings() {
	for (let pid in lastPings) {
		let latency = Date.now() - lastPings[pid];
		if (latency > gm.opts.MAX_PING) {
			console.log("kicking player: ", pid);
			removePlayer(pid);
		}
	}
}
setInterval(checkPings, 500);

function keyProc(tf, socket, room, pid, key) {
	if (seas[room]) {
		if(seas[room].getActorById(pid).retKey) {
			let keyBuf = seas[room].getActorById(pid).retKey(key, tf);
			seas[room].keyBuffers[pid] = keyBuf;
		}
	} else {
		socket.emit(
			"fatalerror",
			"Your sea couldnt be found. Please refresh the browser, and try again."
		);
	}
}

io.on("connection", function(socket) {
	socket.on("pingoid", function(msg, pid) {
		lastPings[pid] = Date.now();
		socket.emit("pongoid", msg);
	});

	socket.on("keydown", function(room, pid, key) {
		//console.log("keydown in room:", room, " player:", pid, " key:", key);
		keyProc(true, socket, room, pid, key);
	});

	socket.on("keyup", function(room, pid, key) {
		//console.log("keyup in room:", room, " player:", pid, " key:", key);
		keyProc(false, socket, room, pid, key);
	});

	socket.on("enter lobby", function(seaid, pid, pname) {
		if (seaid >= SEAS_LIMIT)
			return socket.emit(
				"fatalerror",
				"No lobby found.\nPlease refresh the browser, and try again."
			);
		if (seaid == -1) {
			do {
				seaid += 1;
			} while (seas[seaid] && seas[seaid].isFull);
		}
		if (!seas[seaid]) {
			seas[seaid] = new gm.Sea(seaid, gm.opts.SEA_SIZE);
			setInterval(updateSea, TICKFREQ, seaid);
			console.log("created new sea: " + seaid + " tickfreq: " + TICKFREQ);
		}
		playersSeas[pid] = seaid;
		socket.join("sea-" + seaid);

		let tpos = new Victor(0, 0).randomize(new Victor(0, 0), seas[seaid].size);
		let pship = new gm.Ship(pid, tpos, "server", pname);
		console.log(pship.id, "("+pname+")", "Joined the game!");
		seas[seaid].addPlayer(pship);

		let toClient = {
			sea: seas[seaid].exportState(),
			seaid: seaid
		};

		seas[seaid].updateScoreboard();

		socket.emit("new game", toClient);
	});
});

function updateSea(seaid) {
	// todo: make this actually multithreaded. (if we want to use experimental builds of nodejs lol)
	// todo: remove these dumb todo's

	seas[seaid].update();

	seas[seaid].post_update();

	let state = seas[seaid].exportState();
	io.to("sea-" + seaid).emit("heartbeat", state);
}

http.listen(process.env.PORT, function() {
	console.log("listening on *:" + process.env.PORT);
});
