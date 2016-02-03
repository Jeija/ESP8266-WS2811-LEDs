var INTERVAL_TIME = 0.01;
var MOVESPEED = 0.01;

var parseColor = require("./parsecolor");
var color_even, color_odd, seglen, beat, interval, decay, offset, time;

function init (strips, settings) {
	color_even = settings.color_even;
	color_odd = settings.color_odd;

	switch (settings.decay) {
		case "ultrafast":
			decay = 0.1;
			break;

		case "fast":
			decay = 0.05;
			break;

		case "normal":
			decay = 0.03;
			break;

		case "slow":
			decay = 0.015;
			break;

		default:
			decay = 0.03;
	}

	seglen = settings.segment;
	offset = 0;
	time = 0;

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
		offset += beat / INTERVAL_TIME * MOVESPEED;
		time += INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	var rgb_odd = {}, rgb_even = {};

	if (color_even == "rainbow") {
		rgb_even.red = (Math.sin(time + 0) + 1) * 127;
		rgb_even.green = (Math.sin(time + 2) + 1) * 127;
		rgb_even.blue = (Math.sin(time + 4) + 1) * 127;
	} else {
		rgb_even = parseColor(color_even);
	}

	if (color_odd == "rainbow") {
		rgb_odd.red = (Math.sin(time + 2) + 1) * 127;
		rgb_odd.green = (Math.sin(time + 4) + 1) * 127;
		rgb_odd.blue = (Math.sin(time + 0) + 1) * 127;
	} else {
		rgb_odd = parseColor(color_odd);
	}

	strips.clearAll();
	for (var strip = 0; strip < strips.getStripNumber(); strip++) {
		var evenseg = true;
		for (var seg = 0; seg < Math.ceil(strips.getStripLength(strip) / seglen); ++seg) {
			evenseg = !evenseg;
			for (var n = 0; n < seglen; n++) {
				strips.setPixelSingle(strip, 
					(Math.floor(offset) + seg * seglen + n) % strips.getStripLength(strip),
					evenseg ? rgb_even : rgb_odd
				);
			}
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
	colorband : {
		name : "Colorband",
		settings : {
			color_even : "rainbow",
			color_odd : "rainbow",
			segment : [ 4, 2, 1, 8, 16 ],
			decay : [ "ultrafast", "fast", "normal", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Colored pixel band."
	}
};
