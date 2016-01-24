var DECAY_SPEED = 130;
var MAXVOL = 1000;
var INTERVAL_TIME = 0.01;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");

var interval, color, arecord, audioIn, time = 0, vol = 0;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "10000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = settings.color;

	// Increase
	audioIn.on("data", function(data) {
		var pcm = 0;
		for (i = 0; i < data.length; i++) pcm += Math.abs(data[i]-128);
		vol += pcm / data.length * (MAXVOL / 256);
	});

	// Decay
	interval = setInterval(function () {
		if (vol > MAXVOL) vol = MAXVOL;
		vol -= DECAY_SPEED / INTERVAL_TIME / (MAXVOL - vol);
		if (vol < 0) vol = 0;

		time += INTERVAL_TIME;
	}, 10);
}

function draw (strips) {
	var rgb = {};
	if (color == "rainbow") {
		rgb.red = (Math.sin(time + 0) + 1) * 127;
		rgb.green = (Math.sin(time + 2) + 1) * 127;
		rgb.blue = (Math.sin(time + 4) + 1) * 127;
	} else {
		rgb = parseColor(color);
	}

	strips.clearAll();
	for (var strip = 0; strip < strips.getStripNumber(); strip++) {
		for (var n = 0; n < vol / MAXVOL * strips.getStripLength(strip); ++n) {
			strips.setPixelSingle(strip, n, rgb);
		}
	}
}

function event (ev) {
}

function terminate () {
	arecord.kill();
	clearInterval(interval);
}

module.exports = {
	soundglow : {
		name : "Volume bar",
		settings : {
			color : [ "white", "red", "green", "blue", "rainbow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Light LEDs with music volume."
	}
};
