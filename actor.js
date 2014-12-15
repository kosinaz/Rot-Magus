/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.tile = type.tile;
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = [];
  this.targets = [];
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
    if (this.targets.length > 0) {
      for (i = 0; i < this.targets.length; i += 1) {
        this.computePath(this.targets[i].x, this.targets[i].y);
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
  if (RM.getActor(x, y)) {
    console.log('touched');
  } else {
    RM.map[this.x][this.y].actor = null;
    this.x = x;
    this.y = y;
    RM.map[this.x][this.y].actor = this;
  }
};

RM.Actor.prototype.computeFOV = function () {
  'use strict';
  var ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    return RM.isTransparent(x, y);
  }.bind(this));
  this.fov = [];
  this.targets = [];
  ps.compute(this.x, this.y, 10, function (x, y) {
    var actor = RM.getActor(x, y);
    this.fov.push([x, y]);
    if (actor && (actor.ai !== this.ai)) {
      this.targets.push(actor);
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
