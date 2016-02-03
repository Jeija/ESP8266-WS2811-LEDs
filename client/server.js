// Load Express, socket.io and other external modules
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var cors = require("cors");

// Load MultiStrip, animations and internal modules
var AnimationManager = require("./animations");
var MultiStrip = require("./multistrip");

// Load configuration of strip arrangement
var stripcfg = require("./config.json");

// FPS for rendering only, strip FPS can be set individually
FPS = 50;

var strips = new MultiStrip(stripcfg);

var animqueue = [];
var anim = AnimationManager(strips);
setInterval(function () {
	anim.draw();
}, 1000 / FPS);

app.use(cors());
app.use(express.static(__dirname + "/site"));

app.get("/", function (req, res){
	res.sendFile(path.join(__dirname, "site/livecontrol.html"));
});

app.get("/queue", function (req, res){
	res.sendFile(path.join(__dirname, "site/queue.html"));
});

io.on("connection", function (socket) {
	socket.on("event", function (ev) {
		anim.event(ev.type, ev.data);
	});

	socket.on("get_animations", function (_, fn) {
		fn(anim.getAnimations());
		socket.emit("sync_queue", animqueue);
	});

	socket.on("sync_queue", function (queue) {
		animqueue = queue;
		socket.broadcast.emit("sync_queue", animqueue);
	});

	socket.on("next_animation", function (queue) {
		if (animqueue.length > 0) {
			var na = animqueue.shift();
			anim.setAnimation(na.animation, na.settings);
		}
		io.sockets.emit("sync_queue", animqueue);
	});

	socket.on("get_preview", function (_, fn) {
		fn(strips.getFrameBuffer());
	});

	socket.on("get_current_animation", function (_, fn) {
		fn(anim.getActiveName());
	});
});

app.get("/event", function (req, res){
	if (req.query.type && req.query.data) {
		anim.event(req.query.type, req.query.data);
	} else {
		anim.event("beat");
	}
	res.end();
});

http.listen(8081, function () {
	console.log("Server started!");
});
