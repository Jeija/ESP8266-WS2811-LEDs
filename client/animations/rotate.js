var parseColor = require("./parsecolor");
var color, active, interval, strip = 0;

function init (strips, settings) {
	color = parseColor(settings.color);

	var delta = 0.2;
	switch (settings.speed) {
		case "superfast":
			delta = 0.1;
			break;

		case "fast":
			delta = 0.2;
			break;

		case "normal":
			delta = 0.3;
			break;

		case "slow":
			delta = 0.4;
			break;

		case "superslow":
			delta = 0.6;
			break;
	}

	interval = setInterval(function () {
		if (active) strip++;
		if (strip >= strips.getStripNumber()) active = false;
	}, delta * 1000);
}

function draw (strips) {
	strips.clearAll();
	if (active) {
		strips.fillSingle(strip, {
			red : color.red,
			green : color.green,
			blue : color.blue
		});
	}
}

function event (ev) {
	if (ev == "beat") {
		active = true;
		strip = 0;
	}
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	rotate : {
		name : "Rotate",
		settings : {
			color : [ "white", "red", "green", "blue" ],
			speed : [ "superfast", "fast", "normal", "slow", "superslow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Lights each LED Strip one after the other on beat."
	}
};
