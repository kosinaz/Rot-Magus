/*global RM, ROT*/
RM = {
  map: [],
  pcs: [],
  npcs: [],
  terrainSet: [],
  scheduler: new ROT.Scheduler.Action()
};

RM.init = function () {
  'use strict';
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
};

RM.getTerrainSet = function () {
  'use strict';
  var terrain, i, set;
  set = [];
  for (terrain in RM.terrains) {
    if (RM.terrains.hasOwnProperty(terrain)) {
      for (i = 0; i < RM.terrains.terrain.chance; i += 1) {
        set.push(RM.terrains.terrain);
      }
    }
  }
  return set;
};

RM.getActorSet = function () {
  'use strict';
  var actor, i, set;
  set = [];
  for (actor in RM.actors) {
    if (RM.actors.hasOwnProperty(actor)) {
      for (i = 0; i < RM.actors.actor.chance; i += 1) {
        set.push(RM.actors.actor);
      }
    }
  }
  return set;
};

RM.start = function () {
  'use strict';
  var x, y, i;
  for (x = -50; x < 51; x += 1) {
    RM.map[x] = [];
    for (y = -50; y < 51; y += 1) {
      RM.map[x][y] = {
        terrain: RM.terrainSet.random(),
        actor: ROT.RNG.getPercentage() === 1 ? RM.actorSet.random() : null
      };
    }
  }
  for (i = 0; i < RM.pcs.length; i += 1) {
    RM.pcs[i].setXY(i, 0);
    RM.map[i][0] = {
      terrain: RM.terrains.grass,
      actor: RM.pcs[i]
    };
  }
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};

RM.mapHas = function (x, y) {
  if (RM.map[x]) {
    return RM.map[x][y];
  }
  return false;
};

RM.isTransparent = function (x, y) {
  if (RM.mapHas(x, y)) {
    return RM.map[x][y].terrain.transparent;
  }
  return false;
};

RM.getActor = function (x, y) {
  if (RM.mapHas(x, y)) {
    return RM.map[x][y].actor;
  }
  return false;
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
