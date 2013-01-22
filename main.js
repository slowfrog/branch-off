"use strict";

bo.observer = {};
bo.observer.update = function(event) {
  if (event.type === bo.Game.ACTION_CONSUMED) {
    util.log("Action consumed '" + event.action + "', left: " + event.src.actionCount(event.action));
  } else if (event.type === bo.Game.ACTION_CANCELED) {
    util.log("Action canceled '" + event.action + "', left: " + event.src.actionCount(event.action));
  }
};


bo.IMAGES = {};
bo.IMAGE_FILES = [ "bend.png", "branch.png", "bud.png", "cut.png" ];


// Start function
bo.start = function() {
  util.init();

  var loader = new util.Loader(bo.IMAGES, bo.onImagesLoaded);
  for (var i = 0; i < bo.IMAGE_FILES.length; ++i) {
    loader.addImage(bo.IMAGE_FILES[i]);
  }
  loader.close();
};

bo.onImagesLoaded = function() {
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


  view.addEventListener("mousemove", function(event) {
    bo.onMove(event, view, game);
  }, false);
  
  view.addEventListener("mousedown", function(event) {
    bo.onClick(event, view, ctx, game);
  }, false);

  view.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  }, false);
  
  bo.renderLoop();
};

bo.addImages = function(loader, images) {
  for (var i = 0; i < images.length; ++i) {
    loader.addImage(images[i]);
  }
  loader.close();
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
};

bo.setHover = function(hover) {
  bo.hover = hover;
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

bo.getCellPos = function(x, y) {
  var cx = Math.floor((x - 200) / bo.CELLSIZE);
  var cy = bo.MAXSIZE - 1 - Math.floor(y / bo.CELLSIZE);
  return new bo.Pair(cx, cy);
};

bo.onClick = function(event, view, ctx, game) {
  if (event.button == 0) { // Left-click
    
    var action = bo.mode;

    var x = event.clientX + util.windowScrollX() - view.x0;
    var y = event.clientY + util.windowScrollY() - view.y0;
    
    var pos = bo.getCellPos(x, y);
    if (game.isInside(pos)) {
      game.applyAction(action, pos);
      bo.renderGame(ctx, game);
    } else {
      var action = bo.getButtonAt(x, y);
      if (action) {
        if (action === "grow") {
          bo.grow();
        } else {
          bo.setMode(action);
        }
        util.log("Action clicked: " + action);
      }
    }
  }
};


bo.onMove = function(event, view, game) {
  var x = event.clientX + util.windowScrollX() - view.x0;
  var y = event.clientY + util.windowScrollY() - view.y0;
  var action = bo.getButtonAt(x, y);
  bo.setHover(action);
};
