/*global RM*/
RM.Bar = function (x, y, width, height, empty) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.empty = empty;
};

RM.Bar.prototype.setValue = function (current, max, color) {
  'use strict';
  RM.c.font = '12px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'middle';
  RM.c.drawImage(RM.tileSet,
                 this.empty.x, this.empty.y, this.width, this.height,
                 this.x, this.y, this.width, this.height);
  RM.c.fillStyle = color;
  RM.c.fillRect(this.x, this.y,
                Math.floor(current / max * this.width), this.height);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(current + '/' + max,
                Math.floor(this.x + this.width / 2),
                Math.floor(this.y + this.height / 2));
};
