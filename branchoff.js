"use strict";

var branchoff = {};

branchoff.Pair = function(x, y) {
  this.x = x;
  this.y = y;
};

branchoff.Pair.prototype.toString = function() {
  return this.x + "," + this.y;
};

// Directions
branchoff.NODIR = new branchoff.Pair( 0,  0);
branchoff.NORTH = new branchoff.Pair( 0,  1);
branchoff.EAST  = new branchoff.Pair( 1,  0);
branchoff.SOUTH = new branchoff.Pair( 0, -1);
branchoff.WEST  = new branchoff.Pair(-1,  0);

branchoff.oppositeDir = function(dir) {
  switch (dir) {
  case branchoff.NORTH:
    return branchoff.SOUTH;
  case branchoff.EAST:
    return branchoff.WEST;
  case branchoff.SOUTH:
    return branchoff.NORTH;
  case branchoff.WEST:
    return branchoff.EAST;
  default:
    return branchoff.NODIR;
  }
};

branchoff.rotateDirRight = function(dir) {
  switch (dir) {
  case branchoff.NORTH:
    return branchoff.EAST;
  case branchoff.EAST:
    return branchoff.SOUTH;
  case branchoff.SOUTH:
    return branchoff.WEST;
  case branchoff.WEST:
    return branchoff.NORTH;
  default:
    return branchoff.NODIR;
  }
};

branchoff.rotateDirLeft = function(dir) {
  switch (dir) {
  case branchoff.NORTH:
    return branchoff.WEST;
  case branchoff.EAST:
    return branchoff.NORTH;
  case branchoff.SOUTH:
    return branchoff.EAST;
  case branchoff.WEST:
    return branchoff.SOUTH;
  default:
    return branchoff.NODIR;
  }
};

branchoff.nextPos = function(pos, dir) {
  return new branchoff.Pair(pos.x + dir.x, pos.y + dir.y);
};

// Bud states
branchoff.BUD_NO    = 0;
branchoff.BUD_ALIVE = 1;
branchoff.BUD_DEAD  = 2;

// Section types
branchoff.SECTION_END      = 0;
branchoff.SECTION_STRAIGHT = 1;
branchoff.SECTION_CURVE    = 2;
branchoff.SECTION_FORK     = 3;

// Class representing a section of the tree
branchoff.Section = function(pos, srcdir, type, bud, destdir1, destdir2) {
  this.pos = pos;
  this.srcdir = srcdir;
  this.type = type;
  this.bud = bud;
  this.destdir1 = destdir1;
  this.destdir2 = destdir2;
};


// Class representing the whole tree
branchoff.Tree = function() {
  this.sections = {};
};

branchoff.Tree.prototype.addSection = function(section) {
  var pos = section.pos;
  var key = pos.toString();
  if (this.sections[key] == null) {
    this.sections[key] = [];
  }
  this.sections[key].push(section);
};

branchoff.Tree.prototype.getSectionsAt = function(pos) {
  var key = pos.toString();
  return this.sections[key];
};

branchoff.Tree.prototype.hasSectionAt = function(pos) {
  var sections = this.getSectionsAt(pos);
  return (sections != null) && (sections.length > 0);
};

branchoff.Tree.prototype.grow = function() {
  // Temporary array to store all sections that need to grow, to avoid modifying this.sections
  // while iterating over its keys
  var toGrow = [];
  for (var k in this.sections) {
    var secs = this.sections[k];
    for (var i = 0; i < secs.length; ++i) {
      var section = secs[i];
      if (section.bud == branchoff.BUD_DEAD) {
        section.bud = branchoff.BUD_NO;
        section.type = branchoff.SECTION_END;
        
      } else if (section.bud == branchoff.BUD_ALIVE) {
        toGrow.push(section);
      }
    }
  }

  for (var t = 0; t < toGrow.length; ++t) {
    this.growSection(toGrow[t]);
  }
};

branchoff.Tree.prototype.growSection = function(section) {
  var dest;
  switch (section.type) {
  case branchoff.SECTION_END:
    // Should not happen
    alert("Cannot grow end with bud");
    break;

  case branchoff.SECTION_STRAIGHT:
    dest = branchoff.nextPos(section.pos, branchoff.oppositeDir(section.srcdir));
    this.addSection(new branchoff.Section(dest, section.srcdir,
                                          branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));
    break;

  case branchoff.SECTION_CURVE:
    dest = branchoff.nextPos(section.pos, section.destdir1);
    this.addSection(new branchoff.Section(dest, branchoff.oppositeDir(section.destdir1),
                                          branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));
    break;

  case branchoff.SECTION_FORK:
    dest = branchoff.nextPos(section.pos, section.destdir1);
    this.addSection(new branchoff.Section(dest, branchoff.oppositeDir(section.destdir1),
                                          branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));
    dest = branchoff.nextPos(section.pos, section.destdir2);
    this.addSection(new branchoff.Section(dest, branchoff.oppositeDir(section.destdir2),
                                          branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));
    break;
  }
  section.bud = branchoff.BUD_NO;
};


// A "level" object contains specific condition of the level:
// - width   number of cells in width
// - height  number of cells in height
// - actions object containing the number of allowed actions of each type (null for unlimited):
//   - push
//   - but
//   - branch
//   - grow

branchoff.ACTIONS = ["push", "cut", "branch", "grow"];

// Class representing one game in progress
branchoff.Game = function(level) {
  this.level = level;
  // Duplicate values from the level definition to allow decrementing during play
  this.actions = {};
  for (var a = 0; a < branchoff.ACTIONS.length; ++a) {
    var action = branchoff.ACTIONS[a];
    if (action in level.actions) {
      this.actions[action] = level.actions[action];
    } else {
      this.actions[action] = null;
    }
  }

  this.tree = new branchoff.Tree();
  // TODO: initialize with level definition
  this.tree.addSection(new branchoff.Section(new branchoff.Pair(7, 0), branchoff.SOUTH,
                                             branchoff.SECTION_STRAIGHT, branchoff.BUD_ALIVE));

};

branchoff.Game.prototype.actionCount = function(action) {
  return this.actions[action];
};

branchoff.Game.prototype.actionAllowed = function(action) {
  var countOrNull = this.actionCount(action);
  return (countOrNull === null) || (countOrNull > 0);
};

branchoff.Game.ACTION_CONSUMED = "ACTION_CONSUMED";
branchoff.Game.ACTION_CANCELED = "ACTION_CANCELED";

branchoff.Game.prototype.registerAction = function(action) {
  // Should have checked actionAllowed() before
  var countOrNull = this.actionCount(action);
  if (countOrNull !== null) {
    this.actions[action] -= 1;
    this.notify({ type: branchoff.Game.ACTION_CONSUMED,
                  src: this,
                  action: action });
  }
};

branchoff.Game.prototype.registerIfAllowed = function(action) {
  var allowed = this.actionAllowed(action);
  if (allowed) {
    this.registerAction(action);
  }
  return allowed;
};

branchoff.Game.prototype.unregisterAction = function(action) {
  var countOrNull = this.actionCount(action);
  if (countOrNull !== null) {
    this.actions[action] += 1;
    this.notify({ type: branchoff.Game.ACTION_CANCELED,
                  src: this,
                  action: action });
  }
};

branchoff.Game.prototype.applyAction = function(action, pos) {
  var sections = this.tree.getSectionsAt(pos);
  if (sections != null) {
      
    for (var s = 0; s < sections.length; ++s) {
      var section = sections[s];
      if (action === "cut") {
        if (section.bud === branchoff.BUD_ALIVE) {
          if (this.registerIfAllowed(action)) {
            section.bud = branchoff.BUD_DEAD;
          }
        } else if (section.bud === branchoff.BUD_DEAD) {
          section.bud = branchoff.BUD_ALIVE;
          this.unregisterAction(action);
        }
        
      } else if (action === "push") {
        if (section.bud === branchoff.BUD_ALIVE) {
          if (section.type === branchoff.SECTION_STRAIGHT) {
            if (this.registerIfAllowed(action)) {
              section.type = branchoff.SECTION_CURVE;
              section.destdir1 = branchoff.rotateDirLeft(section.srcdir);
            }
            
          } else if (section.type === branchoff.SECTION_CURVE) {
            if (section.destdir1 === branchoff.rotateDirLeft(section.srcdir)) {
              section.destdir1 = branchoff.oppositeDir(section.destdir1);
            } else {
              section.type = branchoff.SECTION_STRAIGHT;
              this.unregisterAction(action);
            }
          }
        }
        
      } else if (action === "branch") {
        if (section.bud === branchoff.BUD_ALIVE) {
          if ((section.type === branchoff.SECTION_STRAIGHT) ||
              (section.type === branchoff.SECTION_CURVE)) {
            if (this.registerIfAllowed(action)) {
              if (section.type === branchoff.SECTION_CURVE) {
                this.unregisterAction("push");
              }
              section.type = branchoff.SECTION_FORK;
              section.destdir1 = branchoff.rotateDirRight(section.srcdir);
              section.destdir2 = branchoff.rotateDirRight(section.destdir1);
            }
            
          } else if (section.type === branchoff.SECTION_FORK) {
            if (section.destdir2 === branchoff.rotateDirRight(section.destdir1)) {
              if (section.destdir1 === branchoff.rotateDirRight(section.srcdir)) {
                section.destdir2 = branchoff.rotateDirRight(section.destdir2);
              } else {
                section.type = branchoff.SECTION_STRAIGHT;
                this.unregisterAction(action);
              }
            } else {
              section.destdir1 = branchoff.rotateDirRight(section.destdir1);
            }
          }
        }
      }
    }
  }
};

Observable.makeObservable(branchoff.Game);
