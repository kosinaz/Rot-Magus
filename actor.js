/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.tile = type.tile;
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = [];
  this.neighbors = [];
  this.paths = [];
  this.currentPath = [];
};

RM.Actor.prototype.act = function () {
  'use strict';
  var i, path;
  this.paths = [];
  this.computeFOV();
  if (this.ai) {
    /* if there isn't any enemy, hold position */
    if (this.neighbors.length > 0) {
      for (i = 0; i < this.neighbors.length; i += 1) {
        this.computePath(this.neighbors[i].x, this.neighbors[i].y);
      }
      path = this.getShortest(this.paths);
      if (path[1]) {
        this.moveTo(path[1][0], path[1][1]);
      }
    }
  } else {
    RM.draw(this.x, this.y, this.fov);
    RM.engine.lock();
    window.addEventListener('click', this);
  }
};

RM.Actor.prototype.moveTo = function (x, y) {
  'use strict';
  RM.map[this.x][this.y].actor = null;
  this.x = x;
  this.y = y;
  RM.map[this.x][this.y].actor = this;
};

RM.Actor.prototype.computeFOV = function () {
  'use strict';
  var ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    return RM.isTransparent(x, y);
  }.bind(this));
  this.fov = [];
  ps.compute(this.x, this.y, 10, function (x, y) {
    this.fov.push([x, y]);
    if (RM.getActor(x, y)) {
      this.neighbors.push(RM.getActor(x, y));
    }
  }.bind(this));
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    return RM.isPassable(x, y);
  }.bind(this));
  this.currentPath = [];
  a.compute(this.x, this.y, function (x, y) {
    this.currentPath.push([x, y]);
  }.bind(this));
  this.paths.push(this.currentPath);
};

RM.Actor.prototype.getShortest = function (paths) {
  'use strict';
  var i, shortest;
  shortest = paths[0];
  for (i = 1; i < paths.length; i += 1) {
    shortest = shortest.length < paths[i].length ? shortest : paths[i];
  }
  return shortest;
};

RM.Actor.prototype.handleEvent = function (e) {
  'use strict';
  var x, y;
  if (e.type === 'click') {
    window.removeEventListener('click', this);
    x = RM.display.eventToPosition(e)[0] + this.x - 10;
    y = RM.display.eventToPosition(e)[1] + this.y - 10;
    this.computePath(x, y);
    this.moveTo(this.paths[0][1][0], this.paths[0][1][1]);
    RM.engine.unlock();
  }
};
