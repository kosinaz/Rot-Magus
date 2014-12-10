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
