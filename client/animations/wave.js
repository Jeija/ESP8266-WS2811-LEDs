var parseColor = require("./parsecolor");
var color, beat, interval, decay, speed, dispersion, time;

var pos = [], direction = [];

var INTERVAL_TIME = 0.01;
var DISP_INTENSITY = 5;
var BEAT_SPEED_COEFF = 3;
var RBPOS_DENSITY = 0.1;

function init (strips, settings) {
	color = settings.color;
	time = 0;

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1; break;
		case "fast":		decay = 0.05; break;
		case "normal":		decay = 0.03; break;
		case "slow":		decay = 0.015; break;
	}

	switch (settings.speed) {
		case "hyperfast":	speed = 160; break;
		case "ultrafast":	speed = 80; break;
		case "superfast":	speed = 40; break;
		case "faster":		speed = 20; break;
		case "fast":		speed = 10; break;
		case "normal":		speed = 5; break;
		case "slow":		speed = 2; break;
		case "superslow":	speed = 1; break;
	}

	switch (settings.dispersion) {
		case "high":		dispersion = 2.5; break;
		case "normal":		dispersion = 1.7; break;
		case "low":			dispersion = 1; break;
	}

	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		if (settings.startpos == "sync") {
			pos[strip] = 0;
			direction[strip] = 1;
		} else if (settings.startpos == "random") {
			pos[strip] = Math.random() * strips.getStripLength(strip);
			direction[strip] = Math.sign(Math.random() - 0.5);
		}
	}

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;

		time += INTERVAL_TIME;

		for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
			pos[strip] += beat * BEAT_SPEED_COEFF * direction[strip];
			pos[strip] += direction[strip] * INTERVAL_TIME * speed;
			if (pos[strip] < 0) direction[strip] = 1;
			if (pos[strip] > strips.getStripLength(strip)) direction[strip] = -1;
		}
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	strips.clearAll();
	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		for (var px = 0; px < strips.getStripLength(strip); ++px) {
			var diff = 1 - Math.pow(Math.abs(px - pos[strip]), 1 / dispersion) / DISP_INTENSITY;

			var rgb = {};
			if (color == "rainbow") {
				rgb.red = (Math.sin(time + 0) + 1) * 127;
				rgb.green = (Math.sin(time + 2) + 1) * 127;
				rgb.blue = (Math.sin(time + 4) + 1) * 127;
			} else if (color == "rainbowpos") {
				rgb.red = (Math.sin(px * RBPOS_DENSITY + 0) + 1) * 127;
				rgb.green = (Math.sin(px * RBPOS_DENSITY + 2) + 1) * 127;
				rgb.blue = (Math.sin(px * RBPOS_DENSITY + 4) + 1) * 127;
			} else {
				rgb = parseColor(color);
			}

			rgb.red *= diff;
			rgb.green *= diff;
			rgb.blue *= diff;

			if (diff > 0)
				strips.setPixelSingle(strip, px, rgb);
		}
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	wave : {
		name : "Wave",
		settings : {
			color : [ "white", "red", "green", "blue", "rainbow", "rainbowpos" ],
			decay : [ "ultrafast", "fast", "normal", "slow" ],
			speed : [ "normal", "slow", "superslow", "fast", "faster", "superfast", "ultrafast", "hyperfast" ],
			dispersion : [ "normal", "high", "low" ],
			startpos : [ "sync", "random" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Moves brightness wave through the strip, moves faster on beat. No special keys."
	}
};
