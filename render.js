"use strict";

bo.CELLSIZE = 40;
bo.MAXSIZE = 15;

// Tree rendering function
bo.renderTree = function(ctx, tree) {
  for (var x = 0; x < bo.MAXSIZE; ++x) {
    for (var y = 0; y < bo.MAXSIZE; ++y) {
      var pos = new bo.Pair(x, y);
      var sections = tree.getSectionsAt(pos);
      if (sections != null) {
        for (var s = 0; s < sections.length; ++s) {
          var section = sections[s];
          bo.renderSection(ctx, section);
        }
      } else {
        bo.renderBackground(ctx, pos, false, tree);
      }
    }
  }
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
  bo.renderBackground(ctx, pos, true);
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

bo.renderStraight = function(ctx, pos, srcdir, nobackground) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  if (!nobackground) {
    bo.renderBackground(ctx, pos, true);
  }
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

bo.renderCurve = function(ctx, pos, srcdir, destdir, nobackground) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  if (!nobackground) {
    bo.renderBackground(ctx, pos, true);
  }
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

bo.renderStraightOrCurve = function(ctx, pos, srcdir, destdir, nobackground) {
  if ((srcdir.x == -destdir.x) && (srcdir.y == -destdir.y)) {
    bo.renderStraight(ctx, pos, srcdir, nobackground);
    
  } else {
    bo.renderCurve(ctx, pos, srcdir, destdir, nobackground);
  }
};

bo.renderSectionFork = function(ctx, section) {
  if (section.bud == bo.BUD_NO) {
    bo.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir1);
    bo.renderStraightOrCurve(ctx, section.pos, section.srcdir, section.destdir2, true);
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
bo.COLOR_LEAVES_DARK = "#009000";
bo.COLOR_SKY = "#00d0d0";
bo.COLOR_SKY_DARK = "#00c0c0";

bo.renderBackground = function(ctx, pos, inTree, tree) {
  var xd = pos.x * bo.CELLSIZE;
  var yd = (bo.MAXSIZE - 1 - pos.y) * bo.CELLSIZE;
  ctx.fillStyle = (inTree ? bo.COLOR_LEAVES : bo.COLOR_SKY);
  ctx.fillRect(xd, yd, bo.CELLSIZE, bo.CELLSIZE);
  ctx.strokeStyle = (inTree ? bo.COLOR_LEAVES_DARK : bo.COLOR_SKY_DARK);
  bo.renderBorder(ctx, pos);

  if (!inTree) {
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
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(xd + 0.5, yd + 0.5, bo.CELLSIZE - 1, bo.CELLSIZE - 1);
  ctx.globalAlpha = 1;
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

  var tree = new bo.Tree();
  bo.tree = tree;
  /*tree.addSection(new bo.Section(new bo.Pair(7, 0), bo.SOUTH,
                                        bo.SECTION_STRAIGHT, bo.BUD_NO));
  tree.addSection(new bo.Section(new bo.Pair(7, 1), bo.SOUTH,
                                        bo.SECTION_FORK, bo.BUD_NO,
                                        bo.WEST, bo.NORTH));
  tree.addSection(new bo.Section(new bo.Pair(6, 1), bo.EAST,
                                        bo.SECTION_CURVE, bo.BUD_NO, bo.NORTH));
  tree.addSection(new bo.Section(new bo.Pair(6, 2), bo.SOUTH,
                                        bo.SECTION_FORK, bo.BUD_NO,
                                        bo.WEST, bo.NORTH));
  tree.addSection(new bo.Section(new bo.Pair(5, 2), bo.EAST,
                                        bo.SECTION_CURVE, bo.BUD_DEAD,
                                        bo.NORTH));
  tree.addSection(new bo.Section(new bo.Pair(6, 3), bo.SOUTH,
                                        bo.SECTION_STRAIGHT, bo.BUD_ALIVE,
                                        bo.NORTH));
  tree.addSection(new bo.Section(new bo.Pair(7, 2), bo.SOUTH,
                                        bo.SECTION_CURVE, bo.BUD_NO, bo.EAST));
  tree.addSection(new bo.Section(new bo.Pair(8, 2), bo.WEST,
                                        bo.SECTION_FORK, bo.BUD_ALIVE,
                                        bo.NORTH, bo.SOUTH));*/
  tree.addSection(new bo.Section(new bo.Pair(7, 0), bo.SOUTH,
                                        bo.SECTION_STRAIGHT, bo.BUD_ALIVE));
  bo.renderTree(ctx, tree);


  view.addEventListener("mousedown", function(event) {
    bo.onClick(event, view, ctx, tree);
  }, false);

  view.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  }, false);
};

bo.setMode = function(mode) {
  bo.mode = mode;
  document.getElementById("push").className = "button" + (mode === "push" ? "down" : "up");
  document.getElementById("cut").className = "button" + (mode === "cut" ? "down" : "up");
  document.getElementById("branch").className = "button" + (mode === "branch" ? "down" : "up");
};

bo.grow = function() {
  util.log("Growing...");
  bo.tree.grow();
  bo.renderTree(bo.ctx, bo.tree);
  var end = new Date().getTime();
  util.log("Grown", end - start, "ms");
};

bo.onClick = function(event, view, ctx, tree) {
  var start = new Date().getTime();

  var x = event.clientX + util.windowScrollX() - view.x0;
  var y = event.clientY + util.windowScrollY() - view.y0;

  var cx = Math.floor(x / bo.CELLSIZE);
  var cy = bo.MAXSIZE - 1 - Math.floor(y / bo.CELLSIZE);

  if (event.button == 0) {
    var pos = new bo.Pair(cx, cy);
    var sections = tree.getSectionsAt(pos);
    if (sections != null) {
      for (var s = 0; s < sections.length; ++s) {
        var section = sections[s];

        if (bo.mode === "cut") {
          if (section.bud === bo.BUD_ALIVE) {
            section.bud = bo.BUD_DEAD;
          } else if (section.bud === bo.BUD_DEAD) {
            section.bud = bo.BUD_ALIVE;
          }
          
        } else if (bo.mode === "push") {
          if (section.bud === bo.BUD_ALIVE) {
            if (section.type === bo.SECTION_STRAIGHT) {
              section.type = bo.SECTION_CURVE;
              section.destdir1 = section.srcdir.left;
              
            } else if (section.type === bo.SECTION_CURVE) {
              if (section.destdir1 === section.srcdir.left) {
                section.destdir1 = section.destdir1.opposite;
              } else {
                section.type = bo.SECTION_STRAIGHT;
              }
            }
          }
          
        } else if (bo.mode === "branch") {
          if (section.bud === bo.BUD_ALIVE) {
            if ((section.type === bo.SECTION_STRAIGHT) ||
                (section.type === bo.SECTION_CURVE)) {
              section.type = bo.SECTION_FORK;
              section.destdir1 = section.srcdir.right;
              section.destdir2 = section.destdir1.right;
              
            } else if (section.type === bo.SECTION_FORK) {
              if (section.destdir2 === section.destdir1.right) {
                if (section.destdir1 === section.srcdir.right) {
                  section.destdir2 = section.destdir2.right;
                } else {
                  section.type = bo.SECTION_STRAIGHT;
                }
              } else {
                section.destdir1 = section.destdir1.right;
              }
            }
          }
        }
      }
      bo.renderTree(ctx, tree);
    }
  }
};
