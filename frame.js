/*global RM,ROT*/
/**
 * A region of the game window to display parts of 2-dimensional graphical data
 * maps in different sizes, and pass on window events.
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
 * @param {Object} content.empty  The tile coordinates of the empty points.
 */
RM.Frame = function (x, y, width, height, content) {
  'use strict';
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.content = content;
  this.tileWidth = this.width / this.content.width;
  this.tileHeight = this.height / this.content.height;
  this.cursor = {
    x: 0,
    y: 0
  };
  this.selected = null;
  RM.canvas.addEventListener('click', this);
  RM.canvas.addEventListener('mousemove', this);
};

RM.Frame.prototype.center = function (x, y) {
  'use strict';
  this.content.x = x - Math.floor(this.content.width / 2);
  this.content.y = y - Math.floor(this.content.height / 2);
};

RM.Frame.prototype.clear = function () {
  'use strict';
  var x, y;
  for (x = 0; x < this.content.width; x += 1) {
    for (y = 0; y < this.content.height; y += 1) {
      RM.oc.drawImage(RM.tileSet, this.content.empty.x, this.content.empty.y,
                     this.tileWidth, this.tileHeight,
                     this.tileWidth * x + this.x, this.tileHeight * y + this.y,
                     this.tileWidth, this.tileHeight);
    }
  }
};

RM.Frame.prototype.process = function (x, y) {
  'use strict';
  var tile = this.content.empty;
  if (this.content.map) {
    tile = this.content.map.getTile(x, y) || this.content.empty;
  }
  RM.oc.drawImage(RM.tileSet, tile.x, tile.y,
                 this.tileWidth, this.tileHeight,
                 this.tileWidth * (x - this.content.x) + this.x,
                 this.tileHeight * (y - this.content.y) + this.y,
                 this.tileWidth, this.tileHeight);
  if (this.selected && this.selected.x === x && this.selected.y === y) {
    tile = RM.terrains.pointer;
    RM.oc.drawImage(RM.tileSet, tile.x, tile.y,
                   this.tileWidth, this.tileHeight,
                   this.tileWidth * (x - this.content.x) + this.x,
                   this.tileHeight * (y - this.content.y) + this.y,
                   this.tileWidth, this.tileHeight);
  }
};

RM.Frame.prototype.show = function () {
  'use strict';
  RM.c.drawImage(RM.overlay, 0, 0);
};

RM.Frame.prototype.handleEvent = function (e) {
  'use strict';
  var canvas, x, y, contentX, contentY, tile;
  canvas = RM.canvas.getBoundingClientRect();
  x = e.clientX - canvas.left - this.x;
  contentX = Math.floor(x / this.tileWidth) + this.content.x;
  y = e.clientY - canvas.top - this.y;
  contentY = Math.floor(y / this.tileHeight) + this.content.y;
  if (x > 0 && y > 0 && x < this.width && y < this.height) {
    RM.publish(e.type, this, {
      x: contentX,
      y: contentY
    });
    if (e.type === 'mousemove') {
      this.show();
      tile = RM.terrains.pointer;
      RM.c.drawImage(RM.tileSet, tile.x, tile.y,
                   this.tileWidth, this.tileHeight,
                   this.tileWidth * (contentX - this.content.x) + this.x,
                   this.tileHeight * (contentY - this.content.y) + this.y,
                   this.tileWidth, this.tileHeight);
    }
  }
};
