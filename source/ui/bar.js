/*global RM*/
RM.Bar = function (x, y, width, height, background, current, max, color) {
  'use strict';
  this.init(x, y, width, height, background);
  this.current = current;
  this.max = max;
  this.color = color;
};
RM.Bar.extend(RM.UIObject);

RM.Bar.prototype.draw = function () {
  'use strict';
  this.drawBackground();
  RM.c.fillStyle = this.color;
  RM.c.fillRect(this.x, this.y, this.current() / this.max() * this.width,
                this.height);
  this.write(this.current() + '/' + this.max(), '#000000');
};
