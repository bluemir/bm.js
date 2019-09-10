import $ from "../minilib.module.js";

var template = $.template`
<style>
	:host {
	}
</style>
<slot name="header"></slot>
<ol>
</ol>
`;

var itemsTemplate = $.template`
<template x-render-each=".">
	<li id="{{name}}">{{name}} - {{score}}</li>
</template>
`

class ScoreBoard extends $.CustomElement {
	constructor() {
		super(template.content);

		this.on("attribute-changed", async (evt) => {
			console.log("load")
			await this.load(this.attr("from"))
		});

		$.event.on("score:updated", () => this.load(this.attr("from")));
	}
	static get observedAttributes() {
		return ["from"];
	}
	async load(url){
		if (!url) {
			console.warn("not enough information")
			return
		}
		var res = await $.request("GET", url)
		console.log("load complete");

		$.get(this["--shadow"], "ol").appendChild($.render(itemsTemplate, res.json));

		/*
		res.json.map((e) => {
			return $.render(itemTemplate, e);
			// or
			// return $.create("li", {$text: `${e.name} - ${e.score}`, id: e.name});
		}).forEach((e) => {
			$.get(this["--shadow"], "ol").appendChild(e);
		});
		*/
	}
}
customElements.define("score-board", ScoreBoard);

