import $ from "../minilib.module.js";

var count = 0;
var id = $.animateFrame((i) => {
	if (count > 5) {
		console.log("Stop");
		return {stop:true};
	}
	console.log(count++, i)

}, {fps:60})

