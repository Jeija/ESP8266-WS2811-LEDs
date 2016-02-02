var parseColor = require("./parsecolor");
var interval, speed, offset;
var INTERVAL_TIME = 0.01;

function init (strips, settings) {
	color = parseColor(settings.color);
	offset = 0;
	speed = 0;

	switch (settings.speed) {
		case "superfast":	speed = 5; break;
		case "fast":		speed = 3; break;
		case "normal":		speed = 2; break;
		case "slow":		speed = 1; break;
	}

	interval = setInterval(function () {
		if (offset >= 6) offset = 0;
		offset += INTERVAL_TIME * speed;
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		for (var px = 0; px < strips.getStripLength(strip); ++px) {
			var colorid = Math.round(px + offset) % 6;
			if (colorid == 0)
				strips.setPixelSingle(strip, px, { red : 255 });
			else if (colorid == 1)
				strips.setPixelSingle(strip, px, { green : 255 });
			else if (colorid == 2)
				strips.setPixelSingle(strip, px, { blue : 255 });
			else if (colorid == 3)
				strips.setPixelSingle(strip, px, { red : 255, green : 255 });
			else if (colorid == 4)
				strips.setPixelSingle(strip, px, { red : 255, blue : 255 });
			else if (colorid == 5)
				strips.setPixelSingle(strip, px, { green : 255, blue : 100 });
		}
	}
}

function event (ev) {
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	colorful : {
		name : "Colorful",
		settings : {
			speed : [ "normal", "fast", "superfast", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Advance bright colors along the strip."
	}
};
