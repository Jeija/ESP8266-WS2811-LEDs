var parseColor = require("./parsecolor");
var color, beat, interval, decay;

function init (strips, settings) {
	color = parseColor(settings.color);

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

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, 10);
}

function draw (strips) {
	strips.fillAll({
		red : beat * color.red,
		green : beat * color.green,
		blue : beat * color.blue
	});
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	strobe : {
		name : "Strobo",
		settings : {
			color : [ "white", "red", "green", "blue" ],
			decay : [ "ultrafast", "fast", "normal", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Glows bright on beat and decays. No special keys."
	}
};
