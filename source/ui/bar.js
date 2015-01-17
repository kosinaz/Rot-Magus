/*global RM*/
RM.Bar = function (x, y, width, height,
                   currentGetter, maxGetter, color, background) {
  'use strict';
  this.init(x, y, width, height);
  this.currentGetter = currentGetter;
  this.maxGetter = maxGetter;
  this.color = color;
  this.background = background;
};
RM.Bar.extend(RM.UIObject);

RM.Bar.prototype.update = function () {
  'use strict';
  this.current = this.currentGetter();
  this.max = this.maxGetter();
};

RM.Bar.prototype.draw = function () {
  'use strict';
  this.drawBackground();
  RM.c.fillStyle = this.color;
  RM.c.fillRect(this.x, this.y,
                Math.floor(this.current / this.max * this.width), this.height);
  RM.c.font = '12px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'middle';
  RM.c.fillStyle = '#000000';
  RM.c.fillText(this.current + '/' + this.max,
                this.x + this.width / 2, this.y + this.height / 2);
};
