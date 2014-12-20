/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.tile = type.tile;
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = {};
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
    window.addEventListener('mousemove', this);
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
  this.fov = {};
  this.targets = [];
  ps.compute(this.x, this.y, 11, function (x, y) {
    var actor = RM.getActor(x, y);
    this.fov[x + ',' + y] = [x, y];
    if (actor && (actor.ai !== this.ai)) {
      this.targets.push(actor);
    }
  }.bind(this));
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    var actor = RM.getActor(x, y);
    if (RM.isPassable(x, y)) {
      if (actor) {
        if (actor === this) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
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
  var p, x, y, cx, cy;
  p = RM.display.eventToPosition(e);
  x = p[0] + this.x - 11;
  y = p[1] + this.y - 11;
  if (e.type === 'click') {
    if (RM.getActor(x, y) !== this) {
      if (RM.isPassable(x, y)) {
        window.removeEventListener('click', this);
        this.computePath(x, y);
        this.moveTo(this.paths[0][1][0], this.paths[0][1][1]);
        RM.engine.unlock();
      }
    } else {
      /* rest */
      window.removeEventListener('click', this);
      RM.engine.unlock();
    }
  } else {
    cx = RM.cursor[0] + this.x - 11;
    cy = RM.cursor[1] + this.y - 11;
    if (this.fov.hasOwnProperty(cx + ',' + cy)) {
      RM.display.draw(RM.cursor[0], RM.cursor[1], RM.getTile(cx, cy));
    } else {
      RM.display.draw(RM.cursor[0], RM.cursor[1], '');
    }
    if (this.fov.hasOwnProperty(x + ',' + y)) {
      RM.display.draw(p[0], p[1], [RM.getTile(x, y), '*']);
    } else {
      RM.display.draw(p[0], p[1], '*');
    }
    RM.cursor = p;
  }
};
