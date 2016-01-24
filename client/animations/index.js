var path = require("path");
var fs = require("fs");

var animations = {};
var animation_active = null;

// Read shortcut file: contains list of shortcut keys with animations
var shortcuts = JSON.parse(fs.readFileSync(path.join(__dirname, "shortcuts.json")));

fs.readdirSync(__dirname).forEach(function (fn) {
	if (fn != "index.js" && fn.substr(fn.length - 3) == ".js") {
		var mods = require(path.join(__dirname, fn));
		for (var name in mods) {
			animations[name] = mods[name];
		}
	}
});

module.exports = function (strips) {
	function setAnimation (name, settings) {
		if (animation_active) animations[animation_active].terminate();
		animation_active = name;
		if (!animation_active) return false;
		animations[animation_active].init(strips, settings);
	}

	return {
		setAnimation : setAnimation,

		getActiveName : function () {
			return animation_active;
		},

		getAnimations : function () {
			return animations;
		},

		draw : function () {
			if (!animation_active) return false;
			animations[animation_active].draw(strips);
			strips.flip();
		},

		event : function (ev, data) {
			if (!animation_active) return false;

			// Parse shortcuts
			if (ev == "keypress" && shortcuts[data]) {
				setAnimation(shortcuts[data].name, shortcuts[data].settings);
			} else {
				animations[animation_active].event(ev, data);
			}
		}
	};
};
