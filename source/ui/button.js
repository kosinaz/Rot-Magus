/*global RM*/
RM.Button = function (x, y, width, height, text, image, handler) {
  'use strict';
  this.init(x, y, width, height);
  this.text = text;
  this.image = image;
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
  RM.c.drawImage(this.image.source,
                 this.image.x,
                 this.image.y,
                 this.image.width,
                 this.image.height,
                 this.x,
                 this.y,
                 this.width,
                 this.height);
  RM.c.font = '16px Immortal';
  RM.c.textAlign = 'center';
  RM.c.strokeStyle = '#511515';
  RM.c.textBaseline = 'middle';
  RM.c.strokeText(this.text, this.x + this.width / 2, this.y + this.height / 2);
};
