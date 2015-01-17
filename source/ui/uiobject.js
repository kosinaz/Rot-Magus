/*global RM*/
RM.UIObject = function (x, y, width, height) {
  'use strict';
  this.init(x, y, width, height);
};

RM.UIObject.prototype.init = function (x, y, width, height) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.hovered = false;
  this.clicked = false;
};

RM.UIObject.prototype.update = function () {
  'use strict';
};

RM.UIObject.prototype.draw = function () {
  'use strict';
};

RM.UIObject.prototype.isHovered = function () {
  'use strict';
  return RM.mouse.x > this.x &&
         RM.mouse.y > this.y &&
         RM.mouse.x < this.x + this.width &&
         RM.mouse.y < this.y + this.height;
};

RM.UIObject.prototype.updateStats = function () {
  'use strict';
  this.hovered = this.isHovered();
  this.clicked = this.hovered && RM.mouse.clicked && RM.mouse.down;
};

RM.UIObject.prototype.drawBackground = function () {
  'use strict';
  RM.c.drawImage(this.background.source,
                 this.background.x,
                 this.background.y,
                 this.background.width,
                 this.background.height,
                 this.x,
                 this.y,
                 this.width,
                 this.height);
};
