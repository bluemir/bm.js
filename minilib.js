//mininal lib
var $ = (function(){
	var $ = {
		get: function(target, query) {
			if(typeof target.querySelector !== "function") {return $.get(document, target)}
			return target.querySelector(query);
		},
		all: function(target, query) {
			if(typeof target.querySelectorAll !== "function") {return $.all(document, target)}
			return Array.prototype.slice.call(target.querySelectorAll(query));
		},
		create: function(tagname, attr) {
			var newTag = document.createElement(tagname);
			if (attr && attr.$text){
				newTag.appendChild(document.createTextNode(attr.$text));
			}
			if (attr && attr.$html){
				newTag.innerHTML = attr.$html;
			}
			if (attr && attr.$child) {
				newTag.appendChild(attr.$child)
			}
			for(var key in (attr || {})){
				if (key[0] == "$") {
					continue; //skip
				}
				newTag.setAttribute(key, attr[key]);
			}
			return newTag;
		},
		request: async function $request(method, url, options) {
			var opts = options || {};

			if (opts.timestamp !== false) {
				opts.query = opts.query || {};
				opts.query["_timestamp"] = Date.now();
			}

			return new Promise(function(resolve, reject) {
				var req = new XMLHttpRequest();

				Object.keys(opts.header || {}).forEach(function(name){
					req.setRequestHeader(name, opts.header[name]);
				});

				req.addEventListener("readystatechange", function(){
					if (req.readyState  == 4) {
						var result = {
							statusCode: req.status,
							text : req.responseText,
						};
						if (req.status >= 200, req.status < 300){
							if(req.getResponseHeader("Content-Type").includes("application/json")) {
								result.json = JSON.parse(result.text);
							}
							resolve(result)
						} else {
							if(req.getResponseHeader("Content-Type").includes("application/json")) {
								result.json = JSON.parse(result.text);
							}
							reject(result);
						}
					}
				});

				if (opts.auth) {
					console.debug("request with auth", opts.auth)
					// In Chrome and firefox Auth heaer not included request(due to security, see https://bugs.chromium.org/p/chromium/issues/detail?id=128323)
					// so forced set header
					req.open(method, resolveParam(url, opts.params) + queryString(opts.query), true, opts.auth.user, opts.auth.password);
					req.setRequestHeader("Authorization", "Basic " + btoa(opts.auth.user+":"+opts.auth.password));
				} else {
					req.open(method, resolveParam(url, opts.params) + queryString(opts.query), true);
				}

				switch (typeof opts.body) {
					case "object":
						req.setRequestHeader("Content-Type", "application/json")
						req.send(JSON.stringify(opts.body))
						break;
					case "string":
						req.send(opts.body);
						break;
					case "undefined":
						req.send();
						break; // just skip
					default:
						reject("unknown type: req.body");
						break;
				}
			});
		},
		timeout: async function(ms) {
			return new Promise(function(resolve, reject){
				setTimeout(resolve, ms);
			});
		},
		defer: function() {
			var ret = {}
			ret.promise = new Promise(function(resolve, reject){
				ret.resolve = resolve;
				ret.reject = reject;
			});
			return ret;
		},
		prevent: function(func){
			return function(evt){
				evt.preventDefault();
				return func();
			}
		},
		template: function(templateNode, data) {
			var clone = document.importNode(templateNode.content, true);

			var f = function(match, name) {
				var arr = name.split(".")
				var result = data;
				for (var i = 0; i < arr.length; i++) {
					result = result[arr[i]]
				}
				return result;
			}
			var pattern = /{{([a-zA-Z0-9.]+)}}/g
			var each = function(node) {
				switch (node.nodeType) {
					case Node.TEXT_NODE:
						node.textContent = node.textContent.replace(pattern, f)
						break;
					case Node.ELEMENT_NODE:
						for (var i = 0; i <  node.attributes.length; i++) {
							node.attributes[i].value = node.attributes[i].value.replace(pattern, f);
						}
						break;
					default:
				}
				node.childNodes.forEach(each)
			}
			clone.childNodes.forEach(each)

			return clone;
		},
		_registerGlobal() {
			window.$ = this;
		},
	}

	function resolveParam(url, params) {
		if (params == null) {
			return url
		}
		return url.replace(/:([a-zA-Z0-9]+)/g, function(matched, name){
			if (params[name]) {
				return params[name];
			}
			console.warn("[$.reqeust] find param pattern '"+name+"', but not provided");
			return matched;
		});
	}

	function queryString(obj) {
		if (obj == null) {
			return "";
		}
		return "?" + Object.keys(obj).map(function(key) {
			return key + "=" + obj[key];
		}).join("&");
	}

	function extend(TargetClass, proto){
		Object.keys(proto).forEach(function(name) {
			if (name  in TargetClass.prototype) {
				console.warn("cannot extend prototype: '"+name+"' already exist")
				return; // skip
			}
			TargetClass.prototype[name] = proto[name];
		});
	}

	extend(Element, {
		attr: function(name, value){
			if (value !== undefined) {
				if (value === null) {
					this.removeAttribute(name);
				}
				this.setAttribute(name, value)
				return value;
			} else {
				return this.getAttribute(name)
			}
		},
		"removeThis" : function(){
			this.parentElement.removeChild(this);
		},
		"clear" : function(){
			while (this.childNodes.length > 0) {
				this.removeChild(this.childNodes[0]);
			}
		}
	})

	extend(EventTarget, {
		"on" : function() {
			this.addEventListener.apply(this, arguments);
			return this;
		}
	});

	extend(NodeList, {
		"map": Array.prototype.map,
		//"forEach": Array.prototype.forEach,
	});
	extend(Array, {
		"all": function all() { return Promise.all(this); },
		"race": function race() { return Promise.race(this); },

		// with the lovely addiction of ...
		"any": function any() { return Promise.any(this); },
	});

	return $;
})()

// to use as module, uncomment follow line
// export default $;
