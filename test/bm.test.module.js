import * as $ from "../bm.module.js";
import "https://www.chaijs.com/chai.js"
import "https://unpkg.com/mocha/mocha.js"
// https://github.com/Tiliqua/assert-js

console.log(chai, mocha)
let assert = chai.assert;
let expect = chai.expect;

mocha.setup("tdd");
mocha.checkLeaks();

suite("transformCamelcaseToElementName", () => {
	test("#test", () => {
		let t = $.__test__.transformCamelcaseToElementName;

		assert.equal(t("CustomElement"), "custom-element")
		assert.equal(t("Custom_Element"), "custom-element")
		assert.equal(t("custom_Element"), "custom-element")
		assert.equal(t("custom_element"), "custom-element")
		assert.equal(t("custom_element_0"), "custom-element-0")
		assert.equal(t("customHTML_Element"), "custom-html-element")
		assert.equal(t("customHTMLElement"), "custom-html-element")
	});
})

suite("AwaitEventTarget", () => {
	test("#test", async () => {
		let events = new $.AwaitEventTarget();

		events.on("page/next", async () => {
			await $.timeout(50);
			console.log("5 sec rule!")
		});
		events.on("page/next", async () => {
			await $.timeout(30);
			console.log("3 sec rule!")
		});


		let startTime = Date.now();

		await events.fireEvent("page/next");

		let endTime = Date.now();

		assert(endTime - startTime >= 50);
	})
});
suite("AwaitQueue", () => {
	test("#test pre-added job", async () => {
		var q = new $.AwaitQueue();

		q.add(async () => {
			await $.timeout(50);
		});
		q.add(async () => {
			await $.timeout(30);
		});
		q.add(() => {
			return "return value"
		});

		let startTime = Date.now();
		// main event loop
		let i = 0;
		for(let func of q) {
			let ret = await func();
			if (ret == "return value"){
				break;
			}
		}
		let endTime = Date.now();

		assert(endTime - startTime >= 80);
	});
	test("#test wait and add job", async () => {
		var q = new $.AwaitQueue();

		setTimeout(() => {
			q.add(async () => await $.timeout(30));
		}, 50);

		let startTime = Date.now();
		// main event loop
		let i = 0;
		for(let func of q) {
			let ret = await func();
			console.log(ret);
			break;
		}
		let endTime = Date.now();

		assert(endTime - startTime >= 80);
	});
});

suite("$.merge", () => {
	test("basic", async () => {
		let a = {
			foo: "bar",
		};
		let b = {
			t1: "t",
		};

		let t = $.merge(a, b);

		assert.deepEqual(t, {
			foo: "bar",
			t1: "t",
		});

		assert.notEqual(a, t);
		assert.notEqual(b, t);
	});
	test("deep copy", () => {
		let a = {
			foo: {
				t1: "v1",
			},
		}
		let b = {
			foo: {
				t2: "v2",
			}
		}

		let t = $.merge(a, b);

		assert.deepEqual(t, {
			foo: {
				t1: "v1",
				t2: "v2",
			},
		});
	});
	test("multiple args", () => {
		let a = {
			foo: {
				t1: "v1",
			},
		}
		let b = {
			foo: {
				t2: "v2",
			},
		}
		let c = {
			foo: {
				t3:"v3",
			},
		}
		let t = $.merge(a, b, c);

		assert.deepEqual(t, {
			foo: {
				t1: "v1",
				t2: "v2",
				t3: "v3",
			},
		});
	})
});

mocha.run();
