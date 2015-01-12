/*global RM*/
RM.Button = function (x, y, width, height, image, handler) {
  'use strict';
  this.init(x, y, width, height);
  this.image = image;
  this.handler = handler;
};
RM.Button.extend(RM.UIObject);

RM.Button.update = function () {
  'use strict';
  var clicked = this.clicked;
  this.updateStats();
  if (this.clicked && !clicked && this.handler) {
    this.handler(this.x, this.y);
  }
};

RM.Button.draw = function () {
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
};
