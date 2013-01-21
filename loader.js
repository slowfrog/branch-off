"use strict";

/** @constructor */
util.Loader = function(repository, callback, progress) {
  this.loaded = repository;
  this.left = [];
  this.loading = null;
  this.callback = callback;
  this.progress = progress;
};

util.Loader.prototype.addImage = function(url) {
  if (!this.loaded[url]) {
    this.left.push(url);
    this.tryLoad();
  }
};

util.Loader.prototype.close = function() {
  this.closed = true;
  this.checkReady();
};

util.Loader.prototype.checkReady = function() {
  if (this.closed && (this.left.length === 0)) {
    this.callback();
  }
};

util.Loader.prototype.tryLoad = function() {
  if ((this.loading === null) && (this.left.length > 0)) {
    var that = this;
    this.loading = this.left.shift();
    var img = new Image();
    img.onload = function(ev) { that.onLoad(ev, img); }
    img.onerror = function(ev) { that.onError(ev); }
    img.src = this.loading;
  } else if (this.left.length == 0) {
    this.checkReady();
  }
};

util.Loader.prototype.onLoad = function(ev, img) {
  if (this.progress instanceof Function) {
    this.progress(this);
  } else if (this.left.length % 10 == 0) {
    util.log("Still " + this.left.length + " images to load");
  }
  this.loaded[this.loading] = img;
  this.loading = null;

  this.tryLoad();
};

util.Loader.prototype.onError = function(ev) {
  util.log("Error loading", this.loading);
  this.tryLoad();
};

util.Loader.prototype.get = function(name) {
  return this.loaded[name];
};

