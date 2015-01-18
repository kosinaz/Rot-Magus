/*global RM*/
RM.UIObject = function (x, y, width, height, background) {
  'use strict';
  this.init(x, y, width, height, background);
};

RM.UIObject.prototype.init = function (x, y, width, height, background) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.background = background;
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
  if (this.background.length) {
    RM.c.fillStyle = this.background;
    RM.c.fillRect(this.x, this.y, this.width, this.height);
  } else {
    RM.c.drawImage(this.background.source,
                   this.background.x,
                   this.background.y,
                   this.background.width,
                   this.background.height,
                   this.x,
                   this.y,
                   this.width,
                   this.height);
  }
};

RM.UIObject.prototype.write = function (text, color) {
  'use strict';
  RM.c.font = Math.floor(this.height * 0.6) + 'px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'middle';
  RM.c.fillStyle = color;
  RM.c.fillText(text, this.x + this.width / 2, this.y + this.height / 2);
};
