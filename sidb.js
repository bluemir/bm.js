// simple IndexedDB lib
//
function openDB({name, version, update} = {update:()=>{}}){
	var request = indexedDB.open(name);
	request.addEventListener("upgradeneeded", (evt) => {
		var db = evt.target.result;
		update(db)
	})
	return new Promise((resolve, reject) => {
		request.onsuccess = (evt) => {
			var db = evt.target.result;

			resolve(new DB(db))
		}
		request.onerror = reject;
	})
}
class DB {
	constructor(db) {
		this.inner = db
	}
	transaction(stores, mode) {
		var tx = this.inner.transaction(stores, mode)
		return new Transaction(tx)
	}
}
class Transaction{
	constructor(tx) {
		this.inner = tx

		this.complete = new Promise((resolve, reject) => {
			tx.oncomplete = resolve
			tx.onerror = reject
		})
	}
	store(name) {
		var store = this.inner.objectStore(name)
		return new ObjectStore(store)
	}
}
class ObjectStore {
	constructor(os) {
		this.inner = os
	}
	async get(key) {
		var req = this.inner.get(key)
		return new Promise((resolve, reject) => {
			req.onsuccess = (evt) => {
				resolve(evt.target.result)
			};
			req.onerror = reject;
		})
	}
	async put(data) {
		var req = this.inner.put(data)
		return new Promise((resolve, reject) => {
			req.onsuccess = (evt) => {
				resolve(evt.target.result)
			};
			req.onerror = reject;
		})
	}
	async lista() {
		return new Promise((resolve, reject) => {
			var req = this.inner.openCursor();
			var ctx = {}
			var cur;
			ctx[Symbol.iterator] = function() {
				return {
					next: function() {
						if (cur) {
							var here = cur.value;
							return {done: false, value: new Promise((resolve, reject) => {
								req.onsuccess = (evt) => {
									cur = evt.target.result
									resolve(here);
								}
								cur.continue();
							})};
						} else {
							return {done: true};
						}
					}
				};
			}
			req.onsuccess = (evt) => {
				cur = evt.target.result
				resolve(ctx)
			};
		})
	}
	async list() {
		var ctx = await new Promise(resolve =>{
			var req = this.inner.openCursor();
			req.onsuccess = (evt) => { var cur = evt.target.result ; resolve(new Cursor(req, cur)); }
		});
		return ctx
	}
}

class Cursor {
	// TODO async?
	constructor(req, cursor) {
		this.req = req;
		this.inner = cursor;
	}
	*[Symbol.iterator](){
		while (this.inner) {
			yield this._wait_next(this.inner.value);
		}
	}
	async _wait_next(value) {
		this.inner = await new Promise(resolve => {
			this.req.onsuccess = evt => resolve(evt.target.result);
			this.inner.continue();
		})
		return value;
	}
}

class EventIter {
	constructor(obj){
		this.target = obj
	}
	async *[Symbol.asyncIterator](){
		while(true) {
			yield await new Promise(resolve => {
				obj.onclick = function(evt) {resolve(evt)};
			});
		}
	}
}
