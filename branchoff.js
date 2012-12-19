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

// Class representing a section of the tree
bo.Section = function(pos, srcdir, type, bud, destdir1, destdir2) {
  this.pos = pos;
  this.srcdir = srcdir;
  this.type = type;
  this.bud = bud;
  this.destdir1 = destdir1;
  this.destdir2 = destdir2;
};


// Class representing the whole tree
bo.Tree = function() {
  this.sections = {};
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
    this.growOneBud(section.pos, section.srcdir.opposite);
    break;

  case bo.SECTION_CURVE:
    this.growOneBud(section.pos, section.destdir1);
    break;

  case bo.SECTION_FORK:
    this.growOneBud(section.pos, section.destdir1);
    this.growOneBud(section.pos, section.destdir2);
    break;
  }
  section.bud = bo.BUD_NO;
};

bo.Tree.prototype.growOneBud = function(pos, dir) {
  var dest = bo.nextPos(pos, dir);
  var collision = this.hasSectionAt(dest);
  if (collision) {
    this.killSectionsAt(dest);
  }
  var type = (collision ? bo.SECTION_END : bo.SECTION_STRAIGHT);
  var bud = (collision ? bo.BUD_NO : bo.BUD_ALIVE);
  this.addSection(new bo.Section(dest, dir.opposite, type, bud));
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

bo.ACTIONS = ["push", "cut", "branch", "grow"];

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

  this.tree = new bo.Tree();
  // TODO: initialize with level definition
  this.tree.addSection(new bo.Section(new bo.Pair(7, 0), bo.SOUTH,
                                      bo.SECTION_STRAIGHT, bo.BUD_ALIVE));

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

bo.Game.prototype.applyAction = function(action, pos) {
  var sections = this.tree.getSectionsAt(pos);
  if (sections != null) {
      
    for (var s = 0; s < sections.length; ++s) {
      var section = sections[s];
      if (action === "cut") {
        if (section.bud === bo.BUD_ALIVE) {
          if (this.registerIfAllowed(action)) {
            section.bud = bo.BUD_DEAD;
          }
        } else if (section.bud === bo.BUD_DEAD) {
          section.bud = bo.BUD_ALIVE;
          this.unregisterAction(action);
        }
        
      } else if (action === "push") {
        if (section.bud === bo.BUD_ALIVE) {
          if (section.type === bo.SECTION_STRAIGHT) {
            if (this.registerIfAllowed(action)) {
              section.type = bo.SECTION_CURVE;
              section.destdir1 = section.srcdir.left;
            }
            
          } else if (section.type === bo.SECTION_CURVE) {
            if (section.destdir1 === section.srcdir.left) {
              section.destdir1 = section.destdir1.opposite;
            } else {
              section.type = bo.SECTION_STRAIGHT;
              this.unregisterAction(action);
            }
          }
        }
        
      } else if (action === "branch") {
        if (section.bud === bo.BUD_ALIVE) {
          if ((section.type === bo.SECTION_STRAIGHT) ||
              (section.type === bo.SECTION_CURVE)) {
            if (this.registerIfAllowed(action)) {
              if (section.type === bo.SECTION_CURVE) {
                this.unregisterAction("push");
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
                this.unregisterAction(action);
              }
            } else {
              section.destdir1 = section.destdir1.right;
            }
          }
        }
      }
    }
  }
};

Observable.makeObservable(bo.Game);
