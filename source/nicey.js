/*global RM*/
RM.Nicey = function (type, x, y, ai) {
  'use strict';
  this.init(type, x, y, ai);
};
RM.Nicey.extend(RM.Actor);

RM.Nicey.prototype.act = function () {
  'use strict';
  this.regenerate();
  this.scanFOV();
  this.fleeFrom(this.target);
};

RM.Nicey.prototype.scanFOV = function () {
  'use strict';
  this.newTarget = null;
  RM.map.shadowcasting.compute(this.x, this.y, 10, function (x, y) {
    if (!this.newTarget && !RM.map.isPlayer(x, y)) {
      this.newTarget = {
        x: x,
        y: y
      };
    }
  }.bind(this));
  if (this.newTarget) {
    this.target = this.newTarget;
  }
};
