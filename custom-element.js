class CustomElement extends HTMLElement {
	constructor(template) {
		super();
		if (arguments.length != 1 || !arguments[0]) {
			throw Error("CustomElement Must have 1 arguments")
		}
		var clone = document.importNode(template, true)
		var shadow = this["--shadow"] = this.attachShadow({mode: 'open'})
		shadow.appendChild(clone);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		//  to use set follow to custom elements
		//
		//	static get observedAttributes() {
		//		return ["cluster"];
		//	}
		this.fireEvent("attribute-changed", {
			name: name,
			old: oldValue,
			new: newValue,
		});
	}
}
