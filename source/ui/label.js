/*global RM*/
RM.Label = function (x, y, width, height, text, color, bgcolor) {
  'use strict';
  this.init(x, y, width, height);
  this.text = text;
  this.color = color;
  this.bgcolor = bgcolor;
};
RM.Label.extend(RM.UIObject);

RM.Label.prototype.draw = function () {
  'use strict';
  RM.c.fillStyle = this.bgcolor;
  RM.c.fillRect(this.x, this.y, this.width, this.height);
  RM.c.font = '16px Immortal';
  RM.c.textAlign = 'center';
  RM.c.fillStyle = this.color;
  RM.c.textBaseline = 'middle';
  RM.c.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
};

