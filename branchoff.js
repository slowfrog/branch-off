"use strict";

var bo = {};

bo.Pair = function(x, y) {
  this.x = x;
  this.y = y;
};

bo.Pair.prototype.toString = function() {
  return this.x + "," + this.y;
};

// Directions
bo.NODIR = new bo.Pair( 0,  0);
bo.NORTH = new bo.Pair( 0,  1);
bo.EAST  = new bo.Pair( 1,  0);
bo.SOUTH = new bo.Pair( 0, -1);
bo.WEST  = new bo.Pair(-1,  0);

bo.initDirs = function() {
  bo.NODIR.opposite = bo.NODIR;
  bo.NODIR.right = bo.NODIR;
  bo.NODIR.left = bo.NODIR;

  bo.NORTH.opposite = bo.SOUTH;
  bo.NORTH.right = bo.EAST;
  bo.NORTH.left = bo.WEST;

  bo.EAST.opposite = bo.WEST;
  bo.EAST.right = bo.SOUTH;
  bo.EAST.left = bo.NORTH;

  bo.SOUTH.opposite = bo.NORTH;
  bo.SOUTH.right = bo.WEST;
  bo.SOUTH.left = bo.EAST;

  bo.WEST.opposite = bo.EAST;
  bo.WEST.right = bo.NORTH;
  bo.WEST.left = bo.SOUTH;
};

bo.initDirs();

bo.nextPos = function(pos, dir) {
  return new bo.Pair(pos.x + dir.x, pos.y + dir.y);
};

// Bud states
bo.BUD_NO    = 0;
bo.BUD_ALIVE = 1;
bo.BUD_DEAD  = 2;

// Section types
bo.SECTION_END      = 0;
bo.SECTION_STRAIGHT = 1;
bo.SECTION_CURVE    = 2;
bo.SECTION_FORK     = 3;

// Action types
bo.ACTION_CUT = "cut";
bo.ACTION_PUSH = "push";
bo.ACTION_BRANCH = "branch";
bo.ACTION_GROW = "grow";

// Class representing a section of the tree
bo.Section = function(pos, srcdir, type, bud, destdir1, destdir2) {
  this.pos = pos;
  this.srcdir = srcdir;
  this.type = type;
  this.bud = bud;
  this.destdir1 = destdir1;
  this.destdir2 = destdir2;
  this.parent = null;
  this.children = [];
};

bo.Section.prototype.addChild = function(child) {
  this.children.push(child);
};


// Class representing the whole tree
bo.Tree = function(width, height) {
  this.width = width;
  this.height = height;
  this.sections = {};
};

bo.Tree.prototype.isInside = function(pos) {
  return ((pos.x >= 0) && (pos.x < this.width) && (pos.y >= 0) && (pos.y < this.height));
};

bo.Tree.prototype.addSection = function(section) {
  var pos = section.pos;
  var key = pos.toString();
  if (this.sections[key] == null) {
    this.sections[key] = [];
  }
  this.sections[key].push(section);
};

bo.Tree.prototype.getSectionsAt = function(pos) {
  var key = pos.toString();
  return this.sections[key];
};

bo.Tree.prototype.hasSectionAt = function(pos) {
  var sections = this.getSectionsAt(pos);
  return (sections != null) && (sections.length > 0);
};

bo.Tree.prototype.grow = function() {
  // Temporary array to store all sections that need to grow, to avoid modifying this.sections
  // while iterating over its keys
  var toGrow = [];
  for (var k in this.sections) {
    var secs = this.sections[k];
    for (var i = 0; i < secs.length; ++i) {
      var section = secs[i];
      if (section.bud === bo.BUD_DEAD) {
        section.bud = bo.BUD_NO;
        section.type = bo.SECTION_END;
        
      } else if (section.bud === bo.BUD_ALIVE) {
        toGrow.push(section);
      }
    }
  }

  for (var t = 0; t < toGrow.length; ++t) {
    this.growSection(toGrow[t]);
  }
};

bo.Tree.prototype.growSection = function(section) {
  var dest;
  switch (section.type) {
  case bo.SECTION_END:
    // Should not happen
    alert("Cannot grow end with bud");
    break;

  case bo.SECTION_STRAIGHT:
    this.growOneBud(section, section.srcdir.opposite);
    break;

  case bo.SECTION_CURVE:
    this.growOneBud(section, section.destdir1);
    break;

  case bo.SECTION_FORK:
    this.growOneBud(section, section.destdir1);
    this.growOneBud(section, section.destdir2);
    break;
  }
  section.bud = bo.BUD_NO;
};

bo.Tree.prototype.growOneBud = function(section, dir) {
  var pos = section.pos
  var dest = bo.nextPos(pos, dir);
  if (!this.isInside(dest)) {
    // Crash at the bounds of the level
    section.type = bo.SECTION_END;
    section.bud = bo.BUD_NO;
    return;
  }
  
  var collision = this.hasSectionAt(dest);
  if (collision) {
    this.killSectionsAt(dest);
  }
  var type = (collision ? bo.SECTION_END : bo.SECTION_STRAIGHT);
  var bud = (collision ? bo.BUD_NO : bo.BUD_ALIVE);
  var childSection = new bo.Section(dest, dir.opposite, type, bud);
  childSection.parent = section;
  section.addChild(childSection);
  this.addSection(childSection);
};

bo.Tree.prototype.killSectionsAt = function(pos) {
  var sections = this.getSectionsAt(pos);
  for (var i = 0; i < sections.length; ++i) {
    var section = sections[i];
    if (section.bud === bo.BUD_ALIVE) {
      section.bud = bo.BUD_NO;
      if (section.type === bo.SECTION_STRAIGHT) {
        section.type = bo.SECTION_END;
      }
    }
  }
};


// A "level" object contains specific condition of the level:
// - width   number of cells in width
// - height  number of cells in height
// - actions object containing the number of allowed actions of each type (null for unlimited):
//   - push
//   - but
//   - branch
//   - grow

bo.ACTIONS = [ bo.ACTION_PUSH, bo.ACTION_CUT, bo.ACTION_BRANCH, bo.ACTION_GROW ];

// Class representing one game in progress
bo.Game = function(level) {
  this.level = level;
  // Duplicate values from the level definition to allow decrementing during play
  this.actions = {};
  for (var a = 0; a < bo.ACTIONS.length; ++a) {
    var action = bo.ACTIONS[a];
    if (action in level.actions) {
      this.actions[action] = level.actions[action];
    } else {
      this.actions[action] = null;
    }
  }

  this.tree = new bo.Tree(this.level.width, this.level.height);
  this.board = bo.Game.makeBoard(this.level.width, this.level.height, 0);
  this.parseBoard(this.level.board);
};

bo.Game.makeBoard = function(width, height, def) {
  var board = Array(height);
  for (var y = 0; y < height; ++y) {
    var row = Array(width);
    for (var x = 0; x < width; ++x) {
      row[x] = def;
    }
    board[y] = row;
  }
  return board;
};

bo.Game.prototype.parseBoard = function(boardStr) {
  var rows = boardStr.split("\n");
  for (var i = 0; i < rows.length; ++i) {
    var row = rows[i].trim();
    var y = rows.length - 1 - i;
    for (var x = 0; x < row.length; ++x) {
      switch (row.charAt(x)) {
      case "|": 
        this.tree.addSection(new bo.Section(new bo.Pair(x, y), bo.SOUTH,
                                            bo.SECTION_STRAIGHT, bo.BUD_ALIVE));
        // No break: an existing section is also an implicit goal
      case "*":
        this.board[y][x] = 1;
        break;
      }
    }
  }
};

bo.Game.prototype.isGoal = function(x, y) {
  return this.board[y][x] !== 0;
};

bo.Game.prototype.actionCount = function(action) {
  return this.actions[action];
};

bo.Game.prototype.actionAllowed = function(action) {
  var countOrNull = this.actionCount(action);
  return (countOrNull === null) || (countOrNull > 0);
};

bo.Game.ACTION_CONSUMED = "ACTION_CONSUMED";
bo.Game.ACTION_CANCELED = "ACTION_CANCELED";

bo.Game.prototype.registerAction = function(action) {
  // Should have checked actionAllowed() before
  var countOrNull = this.actionCount(action);
  if (countOrNull !== null) {
    this.actions[action] -= 1;
    this.notify({ type: bo.Game.ACTION_CONSUMED,
                  src: this,
                  action: action });
  }
};

bo.Game.prototype.registerIfAllowed = function(action) {
  var allowed = this.actionAllowed(action);
  if (allowed) {
    this.registerAction(action);
  }
  return allowed;
};

bo.Game.prototype.unregisterAction = function(action) {
  var countOrNull = this.actionCount(action);
  if (countOrNull !== null) {
    this.actions[action] += 1;
    this.notify({ type: bo.Game.ACTION_CANCELED,
                  src: this,
                  action: action });
  }
};

bo.Game.prototype.applyToSectionsAtPos = function(pos, func) {
  var sections = this.tree.getSectionsAt(pos);
  if (sections != null) {
    for (var s = 0; s < sections.length; ++s) {
      func.call(this, sections[s]);
    }
  }
};

bo.Game.prototype.applyCutToSection = function(section) {
  if (section.bud === bo.BUD_ALIVE) {
    if (this.registerIfAllowed(bo.ACTION_CUT)) {
      section.bud = bo.BUD_DEAD;
    }
  } else if (section.bud === bo.BUD_DEAD) {
    section.bud = bo.BUD_ALIVE;
    this.unregisterAction(bo.ACTION_CUT);
  }
};

bo.Game.prototype.applyPushToSection = function(section) {
  if (section.bud === bo.BUD_ALIVE) {
    if (section.type === bo.SECTION_STRAIGHT) {
      if (this.registerIfAllowed(bo.ACTION_PUSH)) {
        section.type = bo.SECTION_CURVE;
        section.destdir1 = section.srcdir.left;
      }
      
    } else if (section.type === bo.SECTION_CURVE) {
      if (section.destdir1 === section.srcdir.left) {
        section.destdir1 = section.destdir1.opposite;
      } else {
        section.type = bo.SECTION_STRAIGHT;
        this.unregisterAction(bo.ACTION_PUSH);
      }
    }
  }
};

bo.Game.prototype.applyBranchToSection = function(section) {
  if (section.bud === bo.BUD_ALIVE) {
    if ((section.type === bo.SECTION_STRAIGHT) ||
        (section.type === bo.SECTION_CURVE)) {
      if (this.registerIfAllowed(bo.ACTION_BRANCH)) {
        if (section.type === bo.SECTION_CURVE) {
          this.unregisterAction(bo.ACTION_PUSH);
        }
        section.type = bo.SECTION_FORK;
        section.destdir1 = section.srcdir.right;
        section.destdir2 = section.destdir1.right;
      }
            
    } else if (section.type === bo.SECTION_FORK) {
      if (section.destdir2 === section.destdir1.right) {
        if (section.destdir1 === section.srcdir.right) {
          section.destdir2 = section.destdir2.right;
        } else {
          section.type = bo.SECTION_STRAIGHT;
          this.unregisterAction(bo.ACTION_BRANCH);
        }
      } else {
        section.destdir1 = section.destdir1.right;
      }
    }
  }
};

bo.Game.prototype.actions = {};
bo.Game.prototype.actions[bo.ACTION_CUT] = bo.Game.prototype.applyCutToSection;
bo.Game.prototype.actions[bo.ACTION_PUSH] = bo.Game.prototype.applyPushToSection;
bo.Game.prototype.actions[bo.ACTION_BRANCH] = bo.Game.prototype.applyBranchToSection;

bo.Game.prototype.applyAction = function(action, pos) {
  this.applyToSectionsAtPos(pos, bo.Game.prototype.actions[action]);
};

Observable.makeObservable(bo.Game);
