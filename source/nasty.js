/*global RM*/
RM.Nasty = function (type, x, y, ai) {
  'use strict';
  this.init(type, x, y, ai);
};
RM.Nasty.extend(RM.Actor);

RM.Nasty.prototype.act = function () {
  'use strict';
  this.regenerate();
  this.scanFOV();
  this.moveTo(this.target);
};

RM.Nasty.prototype.scanFOV = function () {
  'use strict';
  this.newTarget = null;
  RM.map.shadowcasting.compute(this.x, this.y, 10, function (x, y) {
    if (!this.newTarget && RM.map.isPlayer(x, y)) {
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
