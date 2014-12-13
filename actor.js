/*global RM, ROT*/
RM.Actor = function (type, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.type = RM.ACTORS[type];
  this.ai = ai;
  this.target = null;
  this.fov = [];
};

RM.Actor.prototype.act = function () {
  'use strict';
  var i, path;
  this.computeFOV();
  for (i = 0; i < this.neighbors; i += 1) {
    this.computePath(this.neighbors[i].x, this.neighbors[i].y);
  }
  path = this.getShortest(this.paths);
  this.moveTo(path[1][0], path[1][1]);
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
    if (RM.isTransparent(x, y)) {
      return RM.map[x][y].terrain.transparent;
    }
    return false;
  }.bind(this));
  this.fov = [];
  ps.compute(this.x, this.y, 10, function (x, y) {
    this.fov.push([x, y]);
    this.neighbors.push(RM.map[x][y].actor);
  }.bind(this));
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    if (RM.mapHas(x, y)) {
      return RM.map[x][y].terrain.passable;
    }
    return false;
  }.bind(this));
  this.currentPath = [];
  a.compute(this.x, this.y, function (x, y) {
    this.currentPath.push([x, y]);
  });
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


