/*global RM*/
RM.Button = function (x, y, width, height, text, handler) {
  'use strict';
  this.init(x, y, width, height);
  this.text = text || '';
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
  this.write(this.text, '#511515');
};
