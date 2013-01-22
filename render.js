"use strict";

bo.CELLSIZE = 40;
bo.MAXSIZE = 15;


bo.clouds = [
  { l: 100, r: 200, nbCircles: 5, dx: 0.3, y: -21 },
  { l: 75, r: 100, nbCircles: 6, dx: 0.2, y: -38 },
  { l: 200, r: 400, nbCircles: 6, dx: 0.8, y: -71 },
];

// Game rendering function
bo.renderGame = function(ctx, game) {
  ctx.save();
  ctx.translate(200, 0);
  bo.renderMain(ctx, game);
  ctx.restore();

  bo.renderGUI(ctx, game);
};

bo.renderGUI = function(ctx, game) {
  ctx.save();
  ctx.fillStyle = "#c0ffff";
  ctx.fillRect(0, 0, 200, 600);

  bo.drawActions(ctx, game);
  ctx.restore();
};

bo.buttonMode = function(action) {
  return (bo.mode === action ? "down" :
          bo.hover === action ? "hover" :
          "normal");
};

bo.drawActions = function(ctx, game) {
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#ff0000";
  bo.drawButton(ctx, 60, 175, bo.IMAGES["bud.png"], bo.buttonMode("grow"));
  bo.drawTextRightAligned(ctx, game.actionCount("grow"), 125, 242);
  bo.drawButton(ctx, 60, 315, bo.IMAGES["bend.png"], bo.buttonMode("push"));
  bo.drawTextRightAligned(ctx, game.actionCount("push"), 125, 382);
  bo.drawButton(ctx, 60, 415, bo.IMAGES["branch.png"], bo.buttonMode("branch"));
  bo.drawTextRightAligned(ctx, game.actionCount("branch"), 125, 482);
  bo.drawButton(ctx, 60, 515, bo.IMAGES["cut.png"], bo.buttonMode("cut"));
  bo.drawTextRightAligned(ctx, game.actionCount("cut"), 125, 582);
};

bo.BUTTON_HEIGHT = 74;

bo.getButtonAt = function(x, y) {
  if ((x >= 60) && (x <= 60 + bo.BUTTON_HEIGHT)) {
    if ((y >= 175) && (y <= 175 + bo.BUTTON_HEIGHT)) {
      return "grow";
    }
    if ((y >= 315) && (y <= 315 + bo.BUTTON_HEIGHT)) {
      return "push";
    }
    if ((y >= 415) && (y <= 415 + bo.BUTTON_HEIGHT)) {
      return "branch";
    }
    if ((y >= 515) && (y <= 515 + bo.BUTTON_HEIGHT)) {
      return "cut";
    }
  }
  return null;
};

bo.drawTextRightAligned = function(ctx, text, x, y) {
  var tm = ctx.measureText(text);
  ctx.fillText(text, x - tm.width, y);
};

bo.BUTTON_COLORS = {
  "normal": [ "#ffffff", "#f0f0f0", "#dddde5", "#888898" ],
  "hover": [ "#888898", "#dddde5", "#f0f0f0", "#ffffff" ],
  "down": [ "#ffb0ff", "#f0a0f0", "#dd90e5", "#886098" ]
};

bo.BUTTON_IMAGES = {};

bo.createButtonImage = function(style) {
  var s = 54;
  var r = 10;
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = r * 2 + s;
  tmpCanvas.height = r * 2 + s;
  var ctx = tmpCanvas.getContext("2d");
  var grad = ctx.createLinearGradient(r + s / 2, 0, r + s / 2, r * 2 + s);
  var colors = bo.BUTTON_COLORS[style];
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.20, colors[1]);
  grad.addColorStop(0.85, colors[2]);
  grad.addColorStop(1, colors[3]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(r + s, 0);
  ctx.quadraticCurveTo(r * 2 + s, 0, r * 2 + s, r);
  ctx.lineTo(r * 2 + s, r + s);
  ctx.quadraticCurveTo(r * 2 + s, r * 2 + s, r + s, r * 2 + s);
  ctx.lineTo(r, r * 2 + s);
  ctx.quadraticCurveTo(0, r * 2 + s, 0, r + s);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.fill();

  bo.BUTTON_IMAGES[style] = tmpCanvas;
};

bo.drawButton = function(ctx, x, y, img, style) {
  var real_style = style || "normal";
  var is = 64
  var s = 54; // Duplicated
  var r = 10; // Duplicated
  ctx.save();
  ctx.translate(x, y);
  if (!bo.BUTTON_IMAGES[real_style]) {
    bo.createButtonImage(real_style);
  }
   
  ctx.drawImage(bo.BUTTON_IMAGES[real_style], 0, 0);
  ctx.drawImage(img, r + (s - is) / 2, r + (s - is) / 2);
  ctx.restore();
};

bo.renderMain = function(ctx, game) {
  ctx.fillStyle = bo.COLOR_SKY;
  ctx.fillRect(0, 0, bo.MAXSIZE * bo.CELLSIZE, bo.MAXSIZE * bo.CELLSIZE);

  //bo.renderGrid(ctx);
  bo.renderClouds(ctx);
  bo.renderGoal(ctx, game);
  bo.renderTree(ctx, game);

};

bo.renderGrid = function(ctx) {
  ctx.save();
  ctx.strokeStyle = bo.COLOR_SKY_DARK;
  for (var x = 0; x < bo.MAXSIZE; ++x) {
    for (var y = 0; y < bo.MAXSIZE; ++y) {
      bo.renderBorder(ctx, new bo.Pair(x, y));
    }
  }
  ctx.restore();
};

bo.renderClouds = function(ctx) {
  for (var c = 0; c < bo.clouds.length; ++c) {
    var cloud = bo.clouds[c];
    if (!cloud.img) {
      cloud.img = bo.generateCloudImage(cloud.l, cloud.r, cloud.nbCircles);
      cloud.x = -2 * cloud.l;
    }
    bo.renderCloud(ctx, cloud.img, cloud.x, cloud.y);
    cloud.x += cloud.dx;
    if (cloud.x > bo.MAXSIZE * bo.CELLSIZE) {
      cloud.img = null;
    }
  }
};

bo.renderGoal = function(ctx, game) {
  ctx.save();
  ctx.strokeStyle = bo.COLOR_SKY_DARK;
  ctx.globalAlpha = 0.6;
  for (var x = 0; x < bo.MAXSIZE; ++x) {
    for (var y = 0; y < bo.MAXSIZE; ++y) {
      if (game.isGoal(x, y)) {
        var xd = x * bo.CELLSIZE;
        var yd = (bo.MAXSIZE - 1 - y) * bo.CELLSIZE;
        ctx.fillStyle = bo.COLOR_GOAL;
        ctx.fillRect(xd, yd, bo.CELLSIZE, bo.CELLSIZE);
        bo.renderBorder(ctx, new bo.Pair(x, y));
      }
    }
  }
  ctx.restore();
};

bo.renderTree = function(ctx, game) {
  var tree = game.tree;
  ctx.save();
  for (var x = 0; x < bo.MAXSIZE; ++x) {
    for (var y = 0; y < bo.MAXSIZE; ++y) {
      var pos = new bo.Pair(x, y);
      var sections = tree.getSectionsAt(pos);
      if (sections != null) {
        bo.renderBackground(ctx, pos, true, tree, game.isGoal(x, y));
        for (var s = 0; s < sections.length; ++s) {
          var section = sections[s];
          bo.renderSection(ctx, section);
        }
      } else {
        bo.renderBackground(ctx, pos, false, tree);
      }
    }
  }
  ctx.restore();
};

bo.distance = function(dx, dy) {
  return Math.sqrt(dx * dx + dy * dy);
};

bo.renderSection = function(ctx, section) {
  var xd = section.pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - section.pos.y) * bo.CELLSIZE;
  switch (section.type) {
    
  case bo.SECTION_END:
    bo.renderSectionEnd(ctx, section);
    break;

  case bo.SECTION_STRAIGHT:
    bo.renderSectionStraight(ctx, section);
    break;
    
  case bo.SECTION_CURVE:
    bo.renderSectionCurve(ctx, section);
    break;

  case bo.SECTION_FORK:
    bo.renderSectionFork(ctx, section);
    break;
    
  default:
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(xd, yd, bo.CELLSIZE, bo.CELLSIZE);
  }
};

bo.renderSectionEnd = function(ctx, section) {
  bo.renderEnd(ctx, section.pos, section.srcdir);
  if (section.bud != bo.BUD_NO) {
    bo.renderBud(ctx, section.pos, section.destdir1, section.bud == bo.BUD_ALIVE);
  }
};

bo.renderEnd = function(ctx, pos, srcdir) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;

  ctx.fillStyle = "#800000";
  switch (srcdir) {
  case bo.SOUTH:
    ctx.fillRect(xd + 0.3 * bo.CELLSIZE, yd + 0.5 * bo.CELLSIZE,
                 0.4 * bo.CELLSIZE, 0.5 * bo.CELLSIZE);
    break;
    
  case bo.EAST:
    ctx.fillRect(xd + 0.5 * bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE,
                 0.5 * bo.CELLSIZE, 0.4 * bo.CELLSIZE);
    break;
    
  case bo.NORTH:
    ctx.fillRect(xd + 0.3 * bo.CELLSIZE, yd,
                 0.4 * bo.CELLSIZE, 0.5 * bo.CELLSIZE);
    break;
    
  case bo.WEST:
    ctx.fillRect(xd, yd + 0.3 * bo.CELLSIZE,
                 0.5 * bo.CELLSIZE, 0.4 * bo.CELLSIZE);
    break;
    
  default:
    ctx.fillRect(xd + 0.3 * bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE,
                 0.4 * bo.CELLSIZE, 0.4 * bo.CELLSIZE);
  }
};

bo.renderSectionStraight = function(ctx, section) {
  if (section.bud == bo.BUD_NO) {
    bo.renderStraight(ctx, section.pos, section.srcdir);
  } else {
    bo.renderEnd(ctx, section.pos, section.srcdir);
    bo.renderBud(ctx, section.pos, section.srcdir.opposite,
                 section.bud == bo.BUD_ALIVE);
  }
};

bo.renderStraight = function(ctx, pos, srcdir) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;

  ctx.fillStyle = "#800000";
  switch (srcdir) {
  case bo.SOUTH:
  case bo.NORTH:
    ctx.fillRect(xd + 0.3 * bo.CELLSIZE, yd,
                 0.4 * bo.CELLSIZE, bo.CELLSIZE);
    break;
    
  case bo.EAST:
  case bo.WEST:
    ctx.fillRect(xd, yd + 0.3 * bo.CELLSIZE,
                 bo.CELLSIZE, 0.4 * bo.CELLSIZE);
    break;
    
  default:
    ctx.fillRect(xd + 0.1 * bo.CELLSIZE, yd + 0.1 * bo.CELLSIZE,
                 0.8 * bo.CELLSIZE, 0.8 * bo.CELLSIZE);
  }
};

bo.renderSectionCurve = function(ctx, section) {
  if (section.bud == bo.BUD_NO) {
    bo.renderCurve(ctx, section.pos, section.srcdir, section.destdir1);
  } else {
    bo.renderEnd(ctx, section.pos, section.srcdir);
    bo.renderBud(ctx, section.pos, section.destdir1, section.bud == bo.BUD_ALIVE);
  }
};

bo.renderCurve = function(ctx, pos, srcdir, destdir) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;

  ctx.fillStyle = "#800000";
  ctx.beginPath();
  switch (srcdir) {
  case bo.SOUTH:
    ctx.moveTo(xd + 0.3 * bo.CELLSIZE, yd + bo.CELLSIZE);
    ctx.lineTo(xd + 0.7 * bo.CELLSIZE, yd + bo.CELLSIZE);
    break;

  case bo.EAST:
    ctx.moveTo(xd + bo.CELLSIZE, yd + 0.7 * bo.CELLSIZE);
    ctx.lineTo(xd + bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE);
    break;

  case bo.NORTH:
    ctx.moveTo(xd + 0.7 * bo.CELLSIZE, yd);
    ctx.lineTo(xd + 0.3 * bo.CELLSIZE, yd);
    break;

  case bo.WEST:
    ctx.moveTo(xd, yd + 0.3 * bo.CELLSIZE);
    ctx.lineTo(xd, yd + 0.7 * bo.CELLSIZE);
    break;
  }


  switch (destdir) {
  case bo.SOUTH:
    ctx.lineTo(xd + 0.3 * bo.CELLSIZE, yd + bo.CELLSIZE);
    ctx.lineTo(xd + 0.7 * bo.CELLSIZE, yd + bo.CELLSIZE);
    break;

  case bo.EAST:
    ctx.lineTo(xd + bo.CELLSIZE, yd + 0.7 * bo.CELLSIZE);
    ctx.lineTo(xd + bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE);
    break;

  case bo.NORTH:
    ctx.lineTo(xd + 0.7 * bo.CELLSIZE, yd);
    ctx.lineTo(xd + 0.3 * bo.CELLSIZE, yd);
    break;

  case bo.WEST:
    ctx.lineTo(xd, yd + 0.3 * bo.CELLSIZE);
    ctx.lineTo(xd, yd + 0.7 * bo.CELLSIZE);
    break;
  }
  
  ctx.closePath();
  ctx.fill();
};

bo.renderStraightOrCurve = function(ctx, pos, srcdir, destdir) {
  if ((srcdir.x == -destdir.x) && (srcdir.y == -destdir.y)) {
    bo.renderStraight(ctx, pos, srcdir);
    
  } else {
    bo.renderCurve(ctx, pos, srcdir, destdir);
  }
};

bo.renderSectionFork = function(ctx, section) {
  if (section.bud == bo.BUD_NO) {
    bo.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir1);
    bo.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir2);
  } else {
    bo.renderEnd(ctx, section.pos, section.srcdir);
    bo.renderBud(ctx, section.pos, section.destdir1, section.bud == bo.BUD_ALIVE);
    bo.renderBud(ctx, section.pos, section.destdir2, section.bud == bo.BUD_ALIVE);
  }
};

bo.renderBud = function(ctx, pos, dir, alive) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  
  ctx.fillStyle = (alive ? "#00ff00" : "#000000");
  ctx.beginPath();
  switch (dir) {
  case bo.NORTH:
    ctx.moveTo(xd + 0.3 * bo.CELLSIZE, yd + 0.4 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.7 * bo.CELLSIZE, yd + 0.4 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.5 * bo.CELLSIZE, yd + 0.1 * bo.CELLSIZE);
    break;

  case bo.EAST:
    ctx.moveTo(xd + 0.6 * bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.6 * bo.CELLSIZE, yd + 0.7 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.9 * bo.CELLSIZE, yd + 0.5 * bo.CELLSIZE);
    break;

  case bo.SOUTH:
    ctx.moveTo(xd + 0.3 * bo.CELLSIZE, yd + 0.6 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.7 * bo.CELLSIZE, yd + 0.6 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.5 * bo.CELLSIZE, yd + 0.9 * bo.CELLSIZE);
    break;

  case bo.WEST:
    ctx.moveTo(xd + 0.4 * bo.CELLSIZE, yd + 0.3 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.4 * bo.CELLSIZE, yd + 0.7 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.1 * bo.CELLSIZE, yd + 0.5 * bo.CELLSIZE);
    break;

  default:
    ctx.moveTo(xd + 0.1 * bo.CELLSIZE, yd + 0.5 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.5 * bo.CELLSIZE, yd + 0.1 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.9 * bo.CELLSIZE, yd + 0.5 * bo.CELLSIZE);
    ctx.lineTo(xd + 0.5 * bo.CELLSIZE, yd + 0.9 * bo.CELLSIZE);
    break;

  }
  ctx.closePath();
  ctx.fill();
};

bo.COLOR_LEAVES = "#00a000";
bo.COLOR_LEAVES_GOAL = "#40b040";
bo.COLOR_LEAVES_DARK = "#009000";
bo.COLOR_SKY = "#00e0e0";
bo.COLOR_SKY_DARK = "#00d0d0";
bo.COLOR_GOAL = "#60a060";

bo.renderBackground = function(ctx, pos, inTree, tree, isGoal) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  if (inTree) {
    ctx.fillStyle = (inTree ?
                     (isGoal ? bo.COLOR_LEAVES_GOAL : bo.COLOR_LEAVES) :
                     bo.COLOR_SKY);
    ctx.fillRect(xd, yd, bo.CELLSIZE, bo.CELLSIZE);
    ctx.strokeStyle = (inTree ? bo.COLOR_LEAVES_DARK : bo.COLOR_SKY_DARK);
    bo.renderBorder(ctx, pos);
    
  } else {
    bo.renderOutline(ctx, pos, tree);
  }
};

bo.renderOutline = function(ctx, pos, tree) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  ctx.fillStyle = bo.COLOR_LEAVES;
  
  // Above
  if (tree.hasSectionAt(bo.nextPos(pos, bo.NORTH))) {
    ctx.beginPath();
    ctx.arc(xd + bo.CELLSIZE / 2, yd - bo.CELLSIZE / 2,
            bo.CELLSIZE / Math.sqrt(2), Math.PI * 0.25, Math.PI * 0.75, false);
    ctx.closePath();
    ctx.fill();
  }
      
  // Right
  if (tree.hasSectionAt(bo.nextPos(pos, bo.EAST))) {
    ctx.beginPath();
    ctx.arc(xd + 3 * bo.CELLSIZE / 2, yd + bo.CELLSIZE / 2,
            bo.CELLSIZE / Math.sqrt(2), Math.PI * 0.75, Math.PI * 1.25, false);
    ctx.closePath();
    ctx.fill();
  }
  
  // Below
  if (tree.hasSectionAt(bo.nextPos(pos, bo.SOUTH))) {
    ctx.beginPath();
    ctx.arc(xd + bo.CELLSIZE / 2, yd + 3 * bo.CELLSIZE / 2,
            bo.CELLSIZE / Math.sqrt(2), -Math.PI * 0.75, -Math.PI * 0.25, false);
    ctx.closePath();
    ctx.fill();
  }
  
  // Left
  if (tree.hasSectionAt(bo.nextPos(pos, bo.WEST))) {
    ctx.beginPath();
    ctx.arc(xd - bo.CELLSIZE / 2, yd + bo.CELLSIZE / 2,
            bo.CELLSIZE / Math.sqrt(2), -Math.PI * 0.25, Math.PI * 0.25, false);
    ctx.closePath();
    ctx.fill();
  }
};

bo.renderBorder = function(ctx, pos) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(xd + 0.5, yd + 0.5, bo.CELLSIZE - 1, bo.CELLSIZE - 1);
  ctx.restore();
};
