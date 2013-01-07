"use strict";

bo.observer = {};
bo.observer.update = function(event) {
  if (event.type === bo.Game.ACTION_CONSUMED) {
    util.log("Action consumed '" + event.action + "', left: " + event.src.actionCount(event.action));
  } else if (event.type === bo.Game.ACTION_CANCELED) {
    util.log("Action canceled '" + event.action + "', left: " + event.src.actionCount(event.action));
  }
};

// Start function
bo.start = function() {
  util.init();
  var view = document.getElementById("view");
  var ctx = view.getContext("2d");
  bo.ctx = ctx;

  
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
      grow: 12
    },
    board: ("...............\n" +
            "...............\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            ".......*.*.....\n" +
            "......****.....\n" +
            "......***......\n" +
            "......***......\n" +
            "......|........")
  };
  var game = new bo.Game(level);
  game.addObserver(bo.observer);
  bo.game = game;
  bo.renderGame(ctx, bo.game);


  view.addEventListener("mousedown", function(event) {
    bo.onClick(event, view, ctx, game);
  }, false);

  view.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  }, false);
  
  bo.renderLoop();
};

bo.stop = function() {
  bo.stopRequested = true;
};

bo.renderLoop = function() {
  var stopped = !!bo.stopRequested;
  if (!stopped) {
    util.requestAnimationFrame.call(null, bo.renderLoop);
  }

  bo.renderGame(bo.ctx, bo.game);
  
};

bo.setMode = function(mode) {
  bo.mode = mode;
  document.getElementById("push").className = "button" + (mode === "push" ? "down" : "up");
  document.getElementById("cut").className = "button" + (mode === "cut" ? "down" : "up");
  document.getElementById("branch").className = "button" + (mode === "branch" ? "down" : "up");
};

bo.grow = function() {
  if (bo.game.actionAllowed("grow")) {
    var start = new Date().getTime();
    util.log("Growing...");
    bo.game.tree.grow();
    bo.game.registerAction("grow");
    bo.renderGame(bo.ctx, bo.game);
    var end = new Date().getTime();
    util.log("Grown", end - start, "ms");

    bo.checkResult();

  } else {
    alert("No more 'Grow'");
  }
};

bo.checkResult = function() {
  // Check if the game is won or lost
  if (bo.game.isLost()) {
    alert("Game lost");
  } else if (bo.game.isWon()) {
    alert("Game won");
  }
};

bo.onClick = function(event, view, ctx, game) {
  if (event.button == 0) { // Left-click
    
    var action = bo.mode;

    var x = event.clientX + util.windowScrollX() - view.x0;
    var y = event.clientY + util.windowScrollY() - view.y0;
    
    var cx = Math.floor(x / bo.CELLSIZE);
    var cy = bo.MAXSIZE - 1 - Math.floor(y / bo.CELLSIZE);

    var pos = new bo.Pair(cx, cy);
    
    game.applyAction(action, pos);
    bo.renderGame(ctx, game);
  }
};
