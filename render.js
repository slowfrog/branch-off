"use strict";

branchoff.CELLSIZE = 40;
branchoff.MAXSIZE = 15;

// Tree rendering function
branchoff.renderTree = function(ctx, tree) {
  for (var x = 0; x < branchoff.MAXSIZE; ++x) {
    for (var y = 0; y < branchoff.MAXSIZE; ++y) {
      var pos = new branchoff.Pair(x, y);
      var sections = tree.getSectionsAt(pos);
      if (sections != null) {
        for (var s = 0; s < sections.length; ++s) {
          var section = sections[s];
          branchoff.renderSection(ctx, section);
        }
      } else {
        branchoff.renderBackground(ctx, pos, false, tree);
      }
    }
  }
};

branchoff.renderSection = function(ctx, section) {
  var xd = section.pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - section.pos.y) * branchoff.CELLSIZE;
  switch (section.type) {
    
  case branchoff.SECTION_END:
    branchoff.renderSectionEnd(ctx, section);
    break;

  case branchoff.SECTION_STRAIGHT:
    branchoff.renderSectionStraight(ctx, section);
    break;
    
  case branchoff.SECTION_CURVE:
    branchoff.renderSectionCurve(ctx, section);
    break;

  case branchoff.SECTION_FORK:
    branchoff.renderSectionFork(ctx, section);
    break;
    
  default:
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(xd, yd, branchoff.CELLSIZE, branchoff.CELLSIZE);
  }

};

branchoff.renderSectionEnd = function(ctx, section) {
  branchoff.renderEnd(ctx, section.pos, section.srcdir);
  if (section.bud != branchoff.BUD_NO) {
    branchoff.renderBud(ctx, section.pos, section.destdir1, section.bud == branchoff.BUD_ALIVE);
  }
};

branchoff.renderEnd = function(ctx, pos, srcdir) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  branchoff.renderBackground(ctx, pos, true);
  ctx.fillStyle = "#800000";
  switch (srcdir) {
  case branchoff.SOUTH:
    ctx.fillRect(xd + 0.3 * branchoff.CELLSIZE, yd + 0.5 * branchoff.CELLSIZE,
                 0.4 * branchoff.CELLSIZE, 0.5 * branchoff.CELLSIZE);
    break;
    
  case branchoff.EAST:
    ctx.fillRect(xd + 0.5 * branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE,
                 0.5 * branchoff.CELLSIZE, 0.4 * branchoff.CELLSIZE);
    break;
    
  case branchoff.NORTH:
    ctx.fillRect(xd + 0.3 * branchoff.CELLSIZE, yd,
                 0.4 * branchoff.CELLSIZE, 0.5 * branchoff.CELLSIZE);
    break;
    
  case branchoff.WEST:
    ctx.fillRect(xd, yd + 0.3 * branchoff.CELLSIZE,
                 0.5 * branchoff.CELLSIZE, 0.4 * branchoff.CELLSIZE);
    break;
    
  default:
    ctx.fillRect(xd + 0.3 * branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE,
                 0.4 * branchoff.CELLSIZE, 0.4 * branchoff.CELLSIZE);
  }
};

branchoff.renderSectionStraight = function(ctx, section) {
  if (section.bud == branchoff.BUD_NO) {
    branchoff.renderStraight(ctx, section.pos, section.srcdir);
  } else {
    branchoff.renderEnd(ctx, section.pos, section.srcdir);
    branchoff.renderBud(ctx, section.pos, branchoff.oppositeDir(section.srcdir),
                        section.bud == branchoff.BUD_ALIVE);
  }
};

branchoff.renderStraight = function(ctx, pos, srcdir, nobackground) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  if (!nobackground) {
    branchoff.renderBackground(ctx, pos, true);
  }
  ctx.fillStyle = "#800000";
  switch (srcdir) {
  case branchoff.SOUTH:
  case branchoff.NORTH:
    ctx.fillRect(xd + 0.3 * branchoff.CELLSIZE, yd,
                 0.4 * branchoff.CELLSIZE, branchoff.CELLSIZE);
    break;
    
  case branchoff.EAST:
  case branchoff.WEST:
    ctx.fillRect(xd, yd + 0.3 * branchoff.CELLSIZE,
                 branchoff.CELLSIZE, 0.4 * branchoff.CELLSIZE);
    break;
    
  default:
    ctx.fillRect(xd + 0.1 * branchoff.CELLSIZE, yd + 0.1 * branchoff.CELLSIZE,
                 0.8 * branchoff.CELLSIZE, 0.8 * branchoff.CELLSIZE);
  }
};

branchoff.renderSectionCurve = function(ctx, section) {
  if (section.bud == branchoff.BUD_NO) {
    branchoff.renderCurve(ctx, section.pos, section.srcdir, section.destdir1);
  } else {
    branchoff.renderEnd(ctx, section.pos, section.srcdir);
    branchoff.renderBud(ctx, section.pos, section.destdir1, section.bud == branchoff.BUD_ALIVE);
  }
};

branchoff.renderCurve = function(ctx, pos, srcdir, destdir, nobackground) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  if (!nobackground) {
    branchoff.renderBackground(ctx, pos, true);
  }
  ctx.fillStyle = "#800000";
  ctx.beginPath();
  switch (srcdir) {
  case branchoff.SOUTH:
    ctx.moveTo(xd + 0.3 * branchoff.CELLSIZE, yd + branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.7 * branchoff.CELLSIZE, yd + branchoff.CELLSIZE);
    break;

  case branchoff.EAST:
    ctx.moveTo(xd + branchoff.CELLSIZE, yd + 0.7 * branchoff.CELLSIZE);
    ctx.lineTo(xd + branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE);
    break;

  case branchoff.NORTH:
    ctx.moveTo(xd + 0.7 * branchoff.CELLSIZE, yd);
    ctx.lineTo(xd + 0.3 * branchoff.CELLSIZE, yd);
    break;

  case branchoff.WEST:
    ctx.moveTo(xd, yd + 0.3 * branchoff.CELLSIZE);
    ctx.lineTo(xd, yd + 0.7 * branchoff.CELLSIZE);
    break;
  }


  switch (destdir) {
  case branchoff.SOUTH:
    ctx.lineTo(xd + 0.3 * branchoff.CELLSIZE, yd + branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.7 * branchoff.CELLSIZE, yd + branchoff.CELLSIZE);
    break;

  case branchoff.EAST:
    ctx.lineTo(xd + branchoff.CELLSIZE, yd + 0.7 * branchoff.CELLSIZE);
    ctx.lineTo(xd + branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE);
    break;

  case branchoff.NORTH:
    ctx.lineTo(xd + 0.7 * branchoff.CELLSIZE, yd);
    ctx.lineTo(xd + 0.3 * branchoff.CELLSIZE, yd);
    break;

  case branchoff.WEST:
    ctx.lineTo(xd, yd + 0.3 * branchoff.CELLSIZE);
    ctx.lineTo(xd, yd + 0.7 * branchoff.CELLSIZE);
    break;
  }
  
  ctx.closePath();
  ctx.fill();
};

branchoff.renderStraightOrCurve = function(ctx, pos, srcdir, destdir, nobackground) {
  if ((srcdir.x == -destdir.x) && (srcdir.y == -destdir.y)) {
    branchoff.renderStraight(ctx, pos, srcdir, nobackground);
    
  } else {
    branchoff.renderCurve(ctx, pos, srcdir, destdir, nobackground);
  }
};

branchoff.renderSectionFork = function(ctx, section) {
  if (section.bud == branchoff.BUD_NO) {
    branchoff.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir1);
    branchoff.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir2, true);
  } else {
    branchoff.renderEnd(ctx, section.pos, section.srcdir);
    branchoff.renderBud(ctx, section.pos, section.destdir1, section.bud == branchoff.BUD_ALIVE);
    branchoff.renderBud(ctx, section.pos, section.destdir2, section.bud == branchoff.BUD_ALIVE);
  }
};

branchoff.renderBud = function(ctx, pos, dir, alive) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;

  ctx.fillStyle = (alive ? "#00ff00" : "#000000");
  ctx.beginPath();
  switch (dir) {
  case branchoff.NORTH:
    ctx.moveTo(xd + 0.3 * branchoff.CELLSIZE, yd + 0.4 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.7 * branchoff.CELLSIZE, yd + 0.4 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.5 * branchoff.CELLSIZE, yd + 0.1 * branchoff.CELLSIZE);
    break;

  case branchoff.EAST:
    ctx.moveTo(xd + 0.6 * branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.6 * branchoff.CELLSIZE, yd + 0.7 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.9 * branchoff.CELLSIZE, yd + 0.5 * branchoff.CELLSIZE);
    break;

  case branchoff.SOUTH:
    ctx.moveTo(xd + 0.3 * branchoff.CELLSIZE, yd + 0.6 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.7 * branchoff.CELLSIZE, yd + 0.6 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.5 * branchoff.CELLSIZE, yd + 0.9 * branchoff.CELLSIZE);
    break;

  case branchoff.WEST:
    ctx.moveTo(xd + 0.4 * branchoff.CELLSIZE, yd + 0.3 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.4 * branchoff.CELLSIZE, yd + 0.7 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.1 * branchoff.CELLSIZE, yd + 0.5 * branchoff.CELLSIZE);
    break;

  default:
    ctx.moveTo(xd + 0.1 * branchoff.CELLSIZE, yd + 0.5 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.5 * branchoff.CELLSIZE, yd + 0.1 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.9 * branchoff.CELLSIZE, yd + 0.5 * branchoff.CELLSIZE);
    ctx.lineTo(xd + 0.5 * branchoff.CELLSIZE, yd + 0.9 * branchoff.CELLSIZE);
    break;

  }
  ctx.closePath();
  ctx.fill();
};

branchoff.COLOR_LEAVES = "#00a000";
branchoff.COLOR_LEAVES_DARK = "#009000";
branchoff.COLOR_SKY = "#00d0d0";
branchoff.COLOR_SKY_DARK = "#00c0c0";

branchoff.renderBackground = function(ctx, pos, inTree, tree) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  ctx.fillStyle = (inTree ? branchoff.COLOR_LEAVES : branchoff.COLOR_SKY);
  ctx.fillRect(xd, yd, branchoff.CELLSIZE, branchoff.CELLSIZE);
  ctx.strokeStyle = (inTree ? branchoff.COLOR_LEAVES_DARK : branchoff.COLOR_SKY_DARK);
  branchoff.renderBorder(ctx, pos);

  if (!inTree) {
    branchoff.renderOutline(ctx, pos, tree);
  }
};

branchoff.renderOutline = function(ctx, pos, tree) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  ctx.fillStyle = branchoff.COLOR_LEAVES;
  
  // Above
  if (tree.hasSectionAt(branchoff.nextPos(pos, branchoff.NORTH))) {
    ctx.beginPath();
    ctx.arc(xd + branchoff.CELLSIZE / 2, yd - branchoff.CELLSIZE / 2,
            branchoff.CELLSIZE / Math.sqrt(2), Math.PI * 0.25, Math.PI * 0.75, false);
    ctx.closePath();
    ctx.fill();
  }
      
  // Right
  if (tree.hasSectionAt(branchoff.nextPos(pos, branchoff.EAST))) {
    ctx.beginPath();
    ctx.arc(xd + 3 * branchoff.CELLSIZE / 2, yd + branchoff.CELLSIZE / 2,
            branchoff.CELLSIZE / Math.sqrt(2), Math.PI * 0.75, Math.PI * 1.25, false);
    ctx.closePath();
    ctx.fill();
  }
  
  // Below
  if (tree.hasSectionAt(branchoff.nextPos(pos, branchoff.SOUTH))) {
    ctx.beginPath();
    ctx.arc(xd + branchoff.CELLSIZE / 2, yd + 3 * branchoff.CELLSIZE / 2,
            branchoff.CELLSIZE / Math.sqrt(2), -Math.PI * 0.75, -Math.PI * 0.25, false);
    ctx.closePath();
    ctx.fill();
  }
  
  // Left
  if (tree.hasSectionAt(branchoff.nextPos(pos, branchoff.WEST))) {
    ctx.beginPath();
    ctx.arc(xd - branchoff.CELLSIZE / 2, yd + branchoff.CELLSIZE / 2,
            branchoff.CELLSIZE / Math.sqrt(2), -Math.PI * 0.25, Math.PI * 0.25, false);
    ctx.closePath();
    ctx.fill();
  }
};

branchoff.renderBorder = function(ctx, pos) {
  var xd = pos.x * branchoff.CELLSIZE;
  var yd = (branchoff.MAXSIZE - 1 - pos.y) * branchoff.CELLSIZE;
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(xd + 0.5, yd + 0.5, branchoff.CELLSIZE - 1, branchoff.CELLSIZE - 1);
  ctx.globalAlpha = 1;
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

  var tree = new branchoff.Tree();
  branchoff.tree = tree;
  /*tree.addSection(new branchoff.Section(new branchoff.Pair(7, 0), branchoff.SOUTH,
                                        branchoff.SECTION_STRAIGHT, branchoff.BUD_NO));
  tree.addSection(new branchoff.Section(new branchoff.Pair(7, 1), branchoff.SOUTH,
                                        branchoff.SECTION_FORK, branchoff.BUD_NO,
                                        branchoff.WEST, branchoff.NORTH));
  tree.addSection(new branchoff.Section(new branchoff.Pair(6, 1), branchoff.EAST,
                                        branchoff.SECTION_CURVE, branchoff.BUD_NO, branchoff.NORTH));
  tree.addSection(new branchoff.Section(new branchoff.Pair(6, 2), branchoff.SOUTH,
                                        branchoff.SECTION_FORK, branchoff.BUD_NO,
                                        branchoff.WEST, branchoff.NORTH));
  tree.addSection(new branchoff.Section(new branchoff.Pair(5, 2), branchoff.EAST,
                                        branchoff.SECTION_CURVE, branchoff.BUD_DEAD,
                                        branchoff.NORTH));
  tree.addSection(new branchoff.Section(new branchoff.Pair(6, 3), branchoff.SOUTH,
                                        branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE,
                                        branchoff.NORTH));
  tree.addSection(new branchoff.Section(new branchoff.Pair(7, 2), branchoff.SOUTH,
                                        branchoff.SECTION_CURVE, branchoff.BUD_NO, branchoff.EAST));
  tree.addSection(new branchoff.Section(new branchoff.Pair(8, 2), branchoff.WEST,
                                        branchoff.SECTION_FORK, branchoff.BUD_ALIVE,
                                        branchoff.NORTH, branchoff.SOUTH));*/
  tree.addSection(new branchoff.Section(new branchoff.Pair(7, 0), branchoff.SOUTH,
                                        branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));
  branchoff.renderTree(ctx, tree);


  view.addEventListener("mousedown", function(event) {
    branchoff.onClick(event, view, ctx, tree);
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
  util.log("Growing...");
  branchoff.tree.grow();
  branchoff.renderTree(branchoff.ctx, branchoff.tree);
  var end = new Date().getTime();
  util.log("Grown", end - start, "ms");
};

branchoff.onClick = function(event, view, ctx, tree) {
  var start = new Date().getTime();

  var x = event.clientX + util.windowScrollX() - view.x0;
  var y = event.clientY + util.windowScrollY() - view.y0;

  var cx = Math.floor(x / branchoff.CELLSIZE);
  var cy = branchoff.MAXSIZE - 1 - Math.floor(y / branchoff.CELLSIZE);

  if (event.button == 0) {
    var pos = new branchoff.Pair(cx, cy);
    var sections = tree.getSectionsAt(pos);
    if (sections != null) {
      for (var s = 0; s < sections.length; ++s) {
        var section = sections[s];

        if (branchoff.mode === "cut") {
          if (section.bud === branchoff.BUD_ALIVE) {
            section.bud = branchoff.BUD_DEAD;
          } else if (section.bud === branchoff.BUD_DEAD) {
            section.bud = branchoff.BUD_ALIVE;
          }
          
        } else if (branchoff.mode === "push") {
          if (section.bud === branchoff.BUD_ALIVE) {
            if (section.type === branchoff.SECTION_STRAIGHT) {
              section.type = branchoff.SECTION_CURVE;
              section.destdir1 = branchoff.rotateDirLeft(section.srcdir);
              
            } else if (section.type === branchoff.SECTION_CURVE) {
              if (section.destdir1 === branchoff.rotateDirLeft(section.srcdir)) {
                section.destdir1 = branchoff.oppositeDir(section.destdir1);
              } else {
                section.type = branchoff.SECTION_STRAIGHT;
              }
            }
          }
          
        } else if (branchoff.mode === "branch") {
          if (section.bud === branchoff.BUD_ALIVE) {
            if ((section.type === branchoff.SECTION_STRAIGHT) ||
                (section.type === branchoff.SECTION_CURVE)) {
              section.type = branchoff.SECTION_FORK;
              section.destdir1 = branchoff.rotateDirRight(section.srcdir);
              section.destdir2 = branchoff.rotateDirRight(section.destdir1);
              
            } else if (section.type === branchoff.SECTION_FORK) {
              if (section.destdir2 === branchoff.rotateDirRight(section.destdir1)) {
                if (section.destdir1 === branchoff.rotateDirRight(section.srcdir)) {
                  section.destdir2 = branchoff.rotateDirRight(section.destdir2);
                } else {
                  section.type = branchoff.SECTION_STRAIGHT;
                }
              } else {
                section.destdir1 = branchoff.rotateDirRight(section.destdir1);
              }
            }
          }
        }
      }
      branchoff.renderTree(ctx, tree);
    }
  }
};
