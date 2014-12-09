/*global ROT, ROTMAGUS*/
ROTMAGUS.Game = function () {
  'use strict';
  var x, y, adventurer, view;
  view = new ROTMAGUS.View();
  this.addObserver(view);
  view.addObserver(this);
  this.fov = [];
  this.map = {};
  this.scheduler = new ROT.Scheduler.Action();
  this.engine = new ROT.Engine(this.scheduler);
  for (x = -50; x < 51; x += 1) {
    for (y = -50; y < 51; y += 1) {
      this.map[x + ',' + y] = this.generateCell();
    }
  }
  adventurer = new ROTMAGUS.Actor('elf');
  this.map['0,0'] = {
    terrain: ROTMAGUS.TERRAINS.grass,
    actor: adventurer
  };
  adventurer.addObserver(this);
  this.scheduler.add(adventurer, true);
  this.engine.start();
};
ROTMAGUS.Game.prototype = new ROTMAGUS.Subject();

ROTMAGUS.Game.prototype.generateCell = function () {
  'use strict';
  var r, monster;
  r = ROT.RNG.getPercentage();
  if (r < 1) {
    monster = new ROTMAGUS.Actor('skeleton', 'guard');
    monster.addObserver(this);
    this.scheduler.add(monster, true);
    return {
      terrain: ROTMAGUS.TERRAINS.grass,
      actor: monster
    };
  }
  if (r < 75) {
    return {
      terrain: ROTMAGUS.TERRAINS.grass
    };
  }
  if (r < 80) {
    return {
      terrain: ROTMAGUS.TERRAINS.redFlower
    };
  }
  if (r < 85) {
    return {
      terrain: ROTMAGUS.TERRAINS.yellowFlower
    };
  }
  if (r < 90) {
    return {
      terrain: ROTMAGUS.TERRAINS.bush
    };
  }
  return {
    terrain: ROTMAGUS.TERRAINS.tree
  };
};

ROTMAGUS.Game.prototype.onNotify = function (note, subject) {
  'use strict';
  var position, fov, i, x0, y0, x1, y1, xn, yn;
  switch (note) {
  case 'active':
    position = this.getPosition(subject);
    fov = this.getFOV(position);
    switch (subject.ai) {
    case 'guard':
      for (i = 0; i < fov.length; i += 1) {
        if (this.map[fov[i].x + ',' + fov[i].y].actor &&
            !this.map[fov[i].x + ',' + fov[i].y].actor.ai) {
          this.move(position, fov[i].x + ',' + fov[i].y);
          subject.ai = 'move';
          subject.target = fov[i].x + ',' + fov[i].y;
          break;
        }
      }
      break;
    case 'move':
      this.move(position, subject.target);
      break;
    default:
      this.notify('show', {
        center: position,
        cells: fov
      });
      this.engine.lock();
    }
    break;
  case 'order':
    if (this.move(subject.from, subject.to)) {
      this.engine.unlock();
    }
    break;
  }
};

ROTMAGUS.Game.prototype.getPosition = function (entity) {
  'use strict';
  var cell;
  for (cell in this.map) {
    if (this.map.hasOwnProperty(cell)) {
      if (this.map[cell].actor === entity) {
        return cell;
      }
    }
  }
};

ROTMAGUS.Game.prototype.move = function (from, to) {
  'use strict';
  var x0, y0, xn, yn, astar, at;
  if (!this.map[to]) {
    return false;
  }
  if (!this.map[to].terrain.passable) {
    return false;
  }
  x0 = parseInt(from.split(',')[0], 10);
  y0 = parseInt(from.split(',')[1], 10);
  xn = parseInt(to.split(',')[0], 10);
  yn = parseInt(to.split(',')[1], 10);
  astar = new ROT.Path.AStar(xn, yn, function (x, y) {
    if (this.map[x + ',' + y]) {
      return this.map[x + ',' + y].terrain.passable;
    }
    return false;
  }.bind(this));
  this.path = [];
  astar.compute(x0, y0, function (x, y) {
    this.path.push([x, y]);
  }.bind(this));
  if (this.path.length > 1) {
    at = this.path[1][0] + ',' + this.path[1][1];
  }
  if (!this.map[at].actor) {
    this.map[at].actor = this.map[from].actor;
    this.map[from].actor = null;
    return true;
  }
  return false;
};

ROTMAGUS.Game.prototype.getFOV = function (position) {
  'use strict';
  var ps, x, y, char;
  ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    if (this.map[x + ',' + y]) {
      if (this.map[x + ',' + y].terrain) {
        return this.map[x + ',' + y].terrain.transparent;
      }
    }
    return false;
  }.bind(this));
  x = parseInt(position.split(',')[0], 10);
  y = parseInt(position.split(',')[1], 10);
  this.fov = [];
  ps.compute(x, y, 10, function (x, y) {
    if (this.map[x + ',' + y]) {
      if (this.map[x + ',' + y].terrain.transparent) {
        if (this.map[x + ',' + y].actor) {
          char = this.map[x + ',' + y].actor.type.char;
        } else {
          char = this.map[x + ',' + y].terrain.char;
        }
        this.fov.push({
          x: x,
          y: y,
          char: char
        });
      }
    }
  }.bind(this));
  return this.fov;
};
