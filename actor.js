/*global ROT, ROTMAGUS*/
RM.Actor = function (type, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.type = ROTMAGUS.ACTORS[type];
  this.ai = ai;
  this.target = null;
  this.fov = [];
};

RM.Actor.prototype.act = function () {
  'use strict';
};

RM.Actor.prototype.setXY = function(xy) {
  'use strict';
  this.x = xy[0];
  this.y = xy[1];
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
  }.bind(this));
};

