import * as $ from "../bm.module.js";
import "https://www.chaijs.com/chai.js"
import "https://unpkg.com/mocha/mocha.js"
// https://github.com/Tiliqua/assert-js

console.log(chai, mocha)
let assert = chai.assert;
let expect = chai.expect;

mocha.setup("tdd");
mocha.checkLeaks();

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
	test("#test", async () => {
		var q = new $.AwaitQueue();


		q.add(async () => {
			await $.timeout(50);
		});
		q.add(() => {
			return "return value"
		});

		// main event loop
		for(let func of q) {
			let ret = await func();
			if (ret == "return value"){
				expect(ret).to.equal("return value");
				return;
			}
		}
	});
});

mocha.run();
