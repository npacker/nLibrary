(function (window, document, undefined) {
	
	var _$ = window.$;
	var _nLibrary = window.nLibrary;
	
	var nLibrary = function (selector, context) {
		return new nLibrary.ElementWrapper(selector, context);
	};
	
	nLibrary.noConflict = function () {
		window.$ = _$;
		window.nLibrary = _nLibrary;
		
		return nLibrary;
	};
	
	nLibrary.ElementWrapper = function (selector, context) {
		this.addEventMethod;
		this.addTextMethod;
		this.DOMElements = [];
		this.selector;
		
		if (typeof selector === 'object') {
			this.concat([selector]);
		}
		
		if (typeof selector === 'string') {
			this.selector = new NSelector(selector, context, this);
		} else {
			this.selector = new NSelector();
		}
	};
	
	nLibrary.ElementWrapper.prototype = {
		addClass : function (name) {
			var self;
			
			self = this;
			
			this.each(function (DOMElement) {
				if (!self.selector.hasClass(name, DOMElement)) {
					DOMElement.className = DOMElement.className.concat(' ' + name).trim();
				}
			});
		},
		
		attr : function (attribute, value) {
			if (attribute && value) {
				this.each(function (DOMElement) {
					DOMElement.setAttribute(attribute, value);
				});
			}
			
			try {
				return this.DOMElements[0].getAttribute(attribute);
			} catch (error) {
				return undefined;
			}
			
		},
		
		childrenOfType : function (type) {
			var childNodes;
			var childrenOfType;
			var wrapper;
			
			try {
				childNodes = this.DOMElements[0].childNodes;			
			} catch (error) {
				return undefined;
			}	
			
			childrenOfType = [];
			wrapper = new nLibrary.ElementWrapper();
			
			foreach(childNodes, function (node) {
				if (node.nodeName.toLowerCase() === type.toLowerCase()) {
					childrenOfType.push(node);
				}
			});
			
			wrapper.concat(childrenOfType);
			
			return wrapper;
		},
		
		concat : function (array) {
			var self;
			
			self = this;
			
			foreach(array, function (element) {
				self.DOMElements.push(element);	
			});
			
			return this;
		},
		
		each : function (fn) {
			foreach(this.DOMElements, fn);
		},
		
		firstChildOfType : function (type) {
			var firstChildOfType;
			
			try {
				firstChildOfType = this.DOMElements[0].getElementsByTagName(type)[0];
			} catch (error) {
				return undefined;
			}
			
			return new nLibrary.ElementWrapper(firstChildOfType);
		},
		
		get : function (index) {
			return this.DOMElements[index];
		},
		
		hasClass : function (name) {
			var result;
			var self;
			
			result = true;
			self = this;
			
			this.each(function (DOMElement) {
				if (!self.selector.hasClass(name, DOMElement)) {
					result = false;
				}
			});
			
			return result;
		},
		
		height : function () {
			try {
				return this.DOMElements[0].offsetHeight;
			} catch (error) {
				return undefined;
			}
		},
		
		id : function(id) {
			try {
				if (typeof id === 'string') {
					this.DOMElements[0].setAttribute('id', id);	
				}
				
				return this.DOMElements[0].getAttribute('id');
			} catch (error) {
				return undefined;
			}		
		},
		
		on : function (eventName, fn) {
			var handler;
			var self;
			
			self = this;	
			handler = function (event) {
				fn.call(new nLibrary.ElementWrapper(event.target), new nLibrary.EventWrapper(event));
			};
			
			if (!this.addEventMethod) {
				if (typeof window.addEventListener  === 'function') {
					this.addEventMethod = 'addEventListener';
				} else if (typeof window.attachEvent === 'function') {
					this.addEventMethod = 'attachEvent';
				} else {
					throw 'Event handler could not be bound.';
				}
			}
			
			this.each(function (DOMElement) {		
				DOMElement[self.addEventMethod](eventName, handler, false);
			});
		},
		
		removeAttr : function(attribute) {
			this.each(function (DOMElement) {
				DOMElement.removeAttribute(attribute);
			});
		},
		
		removeClass : function (name) {
			var self;
			
			self = this;
			
			this.each(function (DOMElement) {
				DOMElement.className = DOMElement.className.replace(name, '').trim();
			});
		},
		
		style : function (style) {
			switch (style) {
				case 'string':
					try {
						return this.DOMElements[0].style[style];
					} catch (error) {
						return undefined;
					}
					break;
				case 'object':
					this.each(function (DOMElement) {
						for (var property in style) {
							DOMElement.style[property] = style[property];
						}
					});
					break;
				default:
					try {
						return this.DOMElements[0].style;
					} catch (error) {
						return undefined;
					}
			}
		},
		
		text : function (text) {
			var self;

			self = this;
			
			if (!this.addTextMethod) {
				if (typeof document.textContent === 'object') {
					this.addTextMethod = 'textContent';
				} else if (typeof document.innerText === 'object') {
					this.addTextMethod = 'innerText';
				}
			}		
			
			if (typeof text === 'string') {
				this.each(function (DOMElement) {
					DOMElement[self.addTextMethod] = text;
				});
			}
			
			try {
				return this.DOMElements[0][this.addTextMethod];
			} catch (error) {
				return undefined;
			}
		},
		
		width : function () {
			try {
				return this.DOMElements[0].offsetWidth;
			} catch (error) {
				return undefined;
			}
		},
	};
	
	nLibrary.EventWrapper = function (event) {
		if (event) {
			this.event = event;
		} else if (window.event) {
			this.event = window.event;
		} else {
			throw 'Could not identify event object.';
		}
		
		if (this.event.target) {
			if (this.event.target.nodeType === 3) {
				this.target = new nLibrary.ElementWrapper(this.event.target.parentNode);
			} else {
				this.target = new nLibrary.ElementWrapper(this.event.target);
			}
		} else if (this.event.srcElement) {
			this.target = new nLibrary.ElementWrapper(this.event.srcElement);
		} else {
			throw 'Could not identify event target.';
		}
		
		this.bubbles = this.event.bubbles;
		this.cancelable = this.event.cancelable;
		this.currentTarget = new nLibrary.ElementWrapper(this.event.currentTarget);
		this.type = this.event.type;
	};
	
	nLibrary.EventWrapper.prototype = {
		initEvent : function () {
			this.event.initEvent();	
		},
		
		preventDefault : function () {
			this.event.preventDefault();
		},
		
		stopPropagation : function () {
			if (typeof this.event.stopPropogation === 'function') {
				this.event.stopPropagation();	
			}
			
			if (this.event.cancelBubble && this.cancelable) {
				this.event.cancelBubble = true;
			}
		},
	};
	
	function NSelector(selector, context, result) {
		this.DOMElements = [];
		this.tokenizer = new NTokenizer();
		
		if (typeof selector === 'string') {
			if (typeof document.querySelectorAll === 'function') {
				if (!context) {
					context = document;
				}
				
				this.DOMElements = context.querySelectorAll(selector);
			} else {
				this.select(selector, context);
			}
		}

		if (result) {
			result = result.concat(this.DOMElements);
		}
	}
	
	NSelector.prototype = {
		select : function (selector, context) {
			var tokens;
			var baseElements;
			var baseToken;
			
			if (!context) {
				context = document.body;
			}
			
			tokens = this.tokenizer.tokenize(selector);
			baseElements = [];
			baseToken = tokens.pop();
			
			switch (baseToken.pattern) {
				case 'TAG':
					baseElements = context.getElementsByTagName(baseToken.match);
					break;
				case 'ID':
					baseElements.push(context.getElementById(baseToken.match));
					break;
				case 'CLASS':
					baseElements = this.selectByClass(baseToken.match, context);
					break;
			}		
			
			foreach(selectors, function (token) {
				this.matchToken(token, element);
			});
		},
		
		matchToken : function (token, element) { 
			switch (token) {
				case 'COMBINATOR':
					this.getSearchStrategy(token.match);
					break;
				case 'TAG':
					this.selectByTag(selector, context);
					break;
				case 'ID':
					break;
				case 'CLASS':
					break;
			}
		},
		
		getSearchStrategy : function (selector) {
			
		},
		
		selectByTag : function (selector, context) {
			
		},
		
		selectById : function (selector, context) {
			
		},
		
		selectByClass : function (selector, context) {
			
		},
		
		selectByPseudo : function (selector, context) {
			
		},
		
		selectAsDescendant : function (selector, element) {
			
		},
		
		selectAsChild : function (selector, element) {
			
		},
		
		selectAsSibling : function (selector, element) {
			
		},
		
		selectAsGeneralSibling : function (selector, element) {
			
		},
		
		hasClass : function (name, element) {
			return ((' ' + element.className + ' ').indexOf(' ' + name + ' ') > -1);
		},
		
		hasId : function (id, element) {
			return (id === element.getAttribute('id'));
		},
		
		matchesTag : function (tag, element) {
			return (tag.toLowerCase() === element.tagName.toLowerCase());
		},
		
		/*select : function (selector, context) {
			var currentElement;
			var currentSelector;
			var elements;
			var foundSelector;
			var selectors;
			var selectorsToFind;
			var self;
		
			if (!context) {
				context = document.body;
			}

			elements = context.getElementsByTagName('*');
			selectors = selector.split(' ');
			self = this;

			foreach(elements, function (element) {
				selectorsToFind = selectors.slice(0);
				currentSelector = selectorsToFind.pop();
				currentElement = element;
				
				while (currentElement && currentSelector) {
					foundSelector = false;
					
					while (currentElement && !foundSelector) {
						if (self.matchesSelector(currentSelector, currentElement)) {
							foundSelector = true;
							currentSelector = selectorsToFind.pop();
						}
						
						currentElement = currentElement.parentElement;
					}
				}
								
				if (!currentSelector) {
					self.DOMElements.push(element);
				}
			});
		},*/
	};
	
	function NTokenizer() {
		this.selector;
		this.tokens = [];
	}
	
	NTokenizer.prototype = {
		tokenize : function (selector) {
			var patterns = {
				COMBINATOR: /^\s*([\s\>\~\+])\s*/,
				TAG: /^(\*|[\w\-]+)/,
				ID: /^#(\*|[\w\-]+)/,
				CLASS: /^\.(\*|[\w\-]+)/,
				PSEUDO: /^\:(\*|[\w\-]+)/,
			};
			
			var match;
			
			this.selector = selector;
			
			while (selector.length > 0) {
				for (var pattern in patterns) {
					match = this.find(patterns[pattern], selector);
					
					if (match) {
						this.push(pattern, match);
						selector = selector.slice(match.length);
					}
				}
			}
			
			return this.tokens;
		},
		
		find : function (pattern, expression) {
			return expression.match(pattern).shift();
		},
		
		push : function (pattern, match) {
			this.tokens.push({
				pattern: pattern,
				match: match,
			});
		},
	};
		
	function foreach(array, fn) {
		var length;
		
		length = array.length;
		
		for (var i = 0; i < length; ++i) {
			fn(array[i], i);
		}
	}
	
	window.$ = window.nLibrary = nLibrary;
	
})(this, document);
