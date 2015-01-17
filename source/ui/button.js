/*global RM*/
RM.Button = function (x, y, width, height, text, background, handler) {
  'use strict';
  this.init(x, y, width, height);
  this.text = text;
  this.background = background;
  this.handler = handler;
};
RM.Button.extend(RM.UIObject);

RM.Button.prototype.update = function () {
  'use strict';
  var clicked = this.clicked;
  this.updateStats();
  if (this.clicked && !clicked && this.handler) {
    this.handler(this.x, this.y);
  }
};

RM.Button.prototype.draw = function () {
  'use strict';
  this.drawBackground();
  RM.c.font = '16px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'middle';
  RM.c.strokeStyle = '#511515';
  RM.c.strokeText(this.text, this.x + this.width / 2, this.y + this.height / 2);
};
