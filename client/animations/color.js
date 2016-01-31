var BEATEFFECT_TIME_SPEED = 0.2;
var INTERVAL_TIME = 0.01;

var parseColor = require("./parsecolor");

var interval, color, decay, beateffect, beat = 0, time = 0;

function init (strips, settings) {
	beateffect = settings.beateffect;
	color = settings.color;

	switch (settings.decay) {
		case "ultrafast": decay = 0.1; break;
		case "fast": decay = 0.05; break;
		case "normal": decay = 0.03; break;
		case "slow": decay = 0.015; break;
		case "ultraslow": decay = 0.008; break;
	}

	// Decay
	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
		time += INTERVAL_TIME;
		if (beateffect == "time") time += beat * BEATEFFECT_TIME_SPEED;

		time += INTERVAL_TIME;
	}, 10);
}

function draw (strips) {
	strips.clearAll();
	var rgb = {};
	if (color == "rainbow") {
		rgb.red = (Math.sin(time + 0) + 1) * 127;
		rgb.green = (Math.sin(time + 2) + 1) * 127;
		rgb.blue = (Math.sin(time + 4) + 1) * 127;
	} else {
		rgb = parseColor(color);
	}

	if (beateffect == "bar") {
		for (var strip = 0; strip < strips.getStripNumber(); strip++) {
			for (var n = 0; n < beat * strips.getStripLength(strip); ++n) {
				strips.setPixelSingle(strip, n, rgb);
			}
		}
	} else {
		strips.fillAll(rgb);
	}
}

function event (ev, key) {
	if (ev == "beat") beat = 1;
	if (ev == "keypress" && key == "c") {
		var red = Math.round(Math.random() * 255);
		var green = Math.round(Math.random() * 255);
		var blue = Math.round(Math.random() * 255);
		color = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
	}
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	color : {
		name : "Color",
		settings : {
			color : "rainbow",
			decay : [ "normal", "fast", "ultrafst", "slow", "ultraslow" ],
			beateffect : [ "none", "bar", "time" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "One color on all LEDs, press c for random new color."
	}
};
