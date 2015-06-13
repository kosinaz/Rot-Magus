/*global RM*/
RM.Label = function (x, y, width, height, text, color) {
  'use strict';
  this.init(x, y, width, height);
  this.text = text;
  this.color = color;
};
RM.Label.extend(RM.UIObject);

RM.Label.prototype.draw = function () {
  'use strict';
  this.write(this.text.length ? this.text : this.text(), this.color);
};

