/*global RM*/
RM.Label = function (x, y, width, height, align) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
};

RM.Label.prototype.setValue = function (value) {
  'use strict';
  RM.c.font = '12px Immortal';
  RM.c.textBaseline = 'top';
  RM.c.fillStyle = '#616161';
  RM.c.fillRect(this.x, this.y, this.width, this.height);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(value, Math.floor(this.x + this.width / 2), this.y);
};
