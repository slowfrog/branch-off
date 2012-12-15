"use strict";

branchoff.observer = {};
branchoff.observer.update = function(event) {
  if (event.type === branchoff.Game.ACTION_CONSUMED) {
    util.log("Action consumed '" + event.action + "', left: " + event.src.actionCount(event.action));
  } else if (event.type === branchoff.Game.ACTION_CANCELED) {
    util.log("Action canceled '" + event.action + "', left: " + event.src.actionCount(event.action));
  }
};

// Start function
branchoff.start = function() {
  util.init();
  var view = document.getElementById("view");
  var ctx = view.getContext("2d");
  branchoff.ctx = ctx;

  
  var viewpos = util.getPagePosition(view);
  view.x0 = viewpos.x;
  view.y0 = viewpos.y;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, view.width, view.height);

  var level = {
    width: 15,
    height: 15,
    actions: {
      push: 5,
      cut: 3,
      branch: 4,
      grow: 8
    }
  };
  var game = new branchoff.Game(level);
  game.addObserver(branchoff.observer);
  branchoff.game = game;
  branchoff.renderTree(ctx, branchoff.game.tree);


  view.addEventListener("mousedown", function(event) {
    branchoff.onClick(event, view, ctx, game);
  }, false);

  view.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  }, false);
};

branchoff.setMode = function(mode) {
  branchoff.mode = mode;
  document.getElementById("push").className = "button" + (mode === "push" ? "down" : "up");
  document.getElementById("cut").className = "button" + (mode === "cut" ? "down" : "up");
  document.getElementById("branch").className = "button" + (mode === "branch" ? "down" : "up");
};

branchoff.grow = function() {
  if (branchoff.game.actionAllowed("grow")) {
    var start = new Date().getTime();
    util.log("Growing...");
    branchoff.game.tree.grow();
    branchoff.game.registerAction("grow");
    branchoff.renderTree(branchoff.ctx, branchoff.game.tree);
    var end = new Date().getTime();
    util.log("Grown", end - start, "ms");
  } else {
    alert("No more 'Grow'");
  }
};

branchoff.onClick = function(event, view, ctx, game) {
  if (event.button == 0) { // Left-click
    
    var action = branchoff.mode;

    var x = event.clientX + util.windowScrollX() - view.x0;
    var y = event.clientY + util.windowScrollY() - view.y0;
    
    var cx = Math.floor(x / branchoff.CELLSIZE);
    var cy = branchoff.MAXSIZE - 1 - Math.floor(y / branchoff.CELLSIZE);

    var pos = new branchoff.Pair(cx, cy);
    
    game.applyAction(action, pos);
    branchoff.renderTree(ctx, game.tree);
  }
};
