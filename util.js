"use strict";

var util = {};

util.nop = function() {};

util.getPagePosition = function(elem) {
  var x = 0;
  var y = 0;
  var e = elem;
  while (e) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent;
  }
  return {x: x, y: y};
};

util.init = function() {
  util.initLog();
  util.initScroll();
};

util.initLog = function() {
  if (!window.console) {
    if (window.opera) {
      util.log = opera.postError;
    } else {
      util.log = util.nop;
    }
  } else if (console.log["apply"]) {
    // Chrome does not allow direct aliasing of console.log... but console.log is a normal
    //  javascript function with an "apply" method
    util.log = function() { console.log.apply(console, arguments); };
  } else {
    // IE9 has console.log, but it's not a real function: no apply available
    // Also, arguments is not a real array, so no join()...
    // And it's only available when developer tools are open
    util.log = function() { var args = [];
                            for (var i in arguments) args.push(arguments[i]);
                            console.log(args.join(" "));
                          };
  }
};

util.initScroll = function() {
  if (window.scrollX !== undefined) {
    util.windowScrollX = function() {
      return window.scrollX;
    };
    util.windowScrollY = function() {
      return window.scrollY;
    };
  } else {
    // This is for Internet Explorer
    util.windowScrollX = function() {
      return document.body.parentNode.scrollLeft;
    };
    util.windowScrollY = function() {
      return document.body.parentNode.scrollTop;
    };
  }
};


// Observable pattern
var Observable = function() {};

Observable.prototype.addObserver = function(observer) {
  if (!this.observers) {
    this.observers = [];
  }
  this.observers.push(observer);
};

Observable.prototype.removeObserver = function(observer) {
  if (this.observers) {
    for (var i = 0; i < this.observers.length; ++i) {
      if (this.observers[i] === observer) {
        this.observers.splice(i, 1);
        --i;
      }
    }
    if (this.observers.length == 0) {
      delete this.observers;
    }
  }
};

Observable.prototype.notify = function(event) {
  if (this.observers) {
    for (var i = 0; i < this.observers.length; ++i) {
      this.observers[i].update(event);
    }
  }
};

Observable.makeObservable = function(klass_or_obj) {
  if (typeof klass_or_obj == "function") {
    var klass = klass_or_obj;
    klass.prototype.addObserver = Observable.prototype.addObserver;
    klass.prototype.removeObserver = Observable.prototype.removeObserver;
    klass.prototype.notify = Observable.prototype.notify;
    
  } else if (typeof klass_or_obj == "object") {
    var obj = klass_or_obj;
    obj.addObserver = Observable.prototype.addObserver;
    obj.removeObserver = Observable.prototype.removeObserver;
    obj.notify = Observable.prototype.notify;
    
  } else {
    throw "Cannot make observable: " + klass_or_obj;
  }
};
