/*global ROT, ROTMAGUS*/
ROTMAGUS.Actor = function (type, ai) {
  'use strict';
  this.type = ROTMAGUS.ACTORS[type];
  this.ai = ai;
  this.target = null;
};
ROTMAGUS.Actor.prototype = new ROTMAGUS.Subject();

ROTMAGUS.Actor.prototype.act = function () {
  'use strict';
  this.notify('active', this);
};
