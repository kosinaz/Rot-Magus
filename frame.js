/*global RM,ROT*/
/**
 * A region of the game window to display parts of 2-dimensional graphical data
 * maps in different sizes, and pass on window events.
 * @param {String} id             The id that is passed on when events occur.
 * @param {Number} x              The x coordinate of the left border.
 * @param {Number} y              The y coordinate of the top border.
 * @param {Number} width          The width of the frame.
 * @param {Number} height         The height of the frame.
 * @param {Object} content        The content to display.
 * @param {Object} content.map    The 2-dimensional map of graphical data.
 * @param {Number} content.x      The x offset of the content.
 * @param {Number} content.y      The y offset of the content.
 * @param {Number} content.width  The width of content's part to display.
 * @param {Number} content.height The height of content's part to display.
 */
RM.Frame = function (id, x, y, width, height, content) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.content = content;
  this.tileWidth = this.width / this.content.width;
  this.tileHeight = this.height / this.content.height;
  this.clickListeners = [];
  window.addEventListener('click', this);
  window.addEventListener('mousemove', this);
};

RM.Frame.center = function (x, y) {
  'use strict';
  this.content.x = x - Math.floor(this.content.width / 2);
  this.content.y = y - Math.floor(this.content.height / 2);
};

RM.Frame.fill = function (tile) {
  'use strict';
  var x, y;
  for (x = 0; x < this.content.width; x += 1) {
    for (y = 0; y < this.content.height; y += 1) {
      RM.c.drawImage(RM.tileSet, tile.x, tile.y,
                     this.tileWidth, this.tileHeight,
                     this.tileWidth * x + this.x, this.tileHeight * y + this.y,
                     this.tileWidth, this.tileHeight);
    }
  }
};

RM.Frame.prototype.show = function (x, y) {
  'use strict';
  var tile = this.content.map.getTile(x, y);
  RM.c.drawImage(RM.tileset, tile.x, tile.y,
                 this.tileWidth, this.tileHeight,
                 this.tileWidth * x + this.x, this.tileHeight * y + this.y,
                 this.tileWidth, this.tileHeight);
};

RM.Frame.prototype.handleEvent = function (e) {
  'use strict';
  var canvas, x, y;
  canvas = RM.canvas.getBoundingClientRect();
  x = Math.floor(e.clientX - canvas.left - this.x + this.content.x)
    / this.content.pointWidth;
  y = Math.floor(e.clientY - canvas.top - this.y + this.content.y)
    / this.content.pointHeight;
  if (x > 0 && y > 0 && x < this.width && y < this.height) {
    RM.publish(e.type, this, {
      x: x,
      y: y
    });
  }
};
