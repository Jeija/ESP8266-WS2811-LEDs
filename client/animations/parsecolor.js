var parse_color = require("parse-color");

module.exports = function (colorstring) {
	var color = parse_color(colorstring);
	if (!color.rgb) return { red : 0, green : 0, blue : 0 };
	return {
		red : color.rgb[0],
		green : color.rgb[1],
		blue : color.rgb[2]
	};
};
