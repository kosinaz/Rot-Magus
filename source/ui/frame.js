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
RM.Frame = function (x, y, width, height, background, content, handler) {
  'use strict';
  var xb, yb;
  this.init(x, y, width, height, background);
  this.content = content;
  this.handler = handler;
  this.tileWidth = this.width / this.content.width;
  this.tileHeight = this.height / this.content.height;
  this.center(0, 0);
  this.selected = {};
};
RM.Frame.extend(RM.UIObject);

RM.Frame.prototype.update = function () {
  'use strict';
  var clicked, x, y;
  clicked = this.clicked;
  this.updateStats();
  if (this.clicked && !clicked && this.handler) {
    x = Math.floor((RM.mouse.x - this.x) / this.tileWidth) + this.content.x;
    y = Math.floor((RM.mouse.y - this.y) / this.tileHeight) + this.content.y;
    this.handler(x, y);
  }
};

RM.Frame.prototype.draw = function () {
  'use strict';
  var x, y, tile, i;
  this.drawBackground();
  for (x = this.content.x; x < this.content.width; x += 1) {
    for (y = this.content.y; y < this.content.height; y += 1) {
      tile = this.content.empty;
      if (this.content.map) {
        tile = this.getTile(x, y);
      }
      RM.c.drawImage(RM.tileSet,
                     tile.x,
                     tile.y,
                     this.tileWidth,
                     this.tileHeight,
                     this.tileWidth * (x - this.content.x) + this.x,
                     this.tileHeight * (y - this.content.y) + this.y,
                     this.tileWidth,
                     this.tileHeight);
      for (i in this.selected) {
        if (this.selected.hasOwnProperty(i)) {
          if (this.selected[i] &&
              this.selected[i].x === x &&
              this.selected[i].y === y) {
            tile = this.selected[i].tile;
            RM.c.drawImage(RM.tileSet,
                           tile.x,
                           tile.y,
                           this.tileWidth,
                           this.tileHeight,
                           this.tileWidth * (x - this.content.x) + this.x,
                           this.tileHeight * (y - this.content.y) + this.y,
                           this.tileWidth,
                           this.tileHeight);
          }
        }
      }
    }
  }
};

RM.Frame.prototype.center = function (x, y) {
  'use strict';
  this.content.x = x - Math.floor(this.content.width / 2);
  this.content.y = y - Math.floor(this.content.height / 2);
};

RM.Frame.prototype.isSelected = function (category, target) {
  'use strict';
  return this.selected[category] &&
    this.selected[category].x === target.x &&
    this.selected[category].y === target.y;
};

/**
 * Returns the tile coordinates of the data stored in an arbitrarily defined
 * point of the map.
 * @param   {String} p The coordinates of the point separated with commas,
 *                   or the first coordinate of the point, followed by the
 *                   others as additional arguments.
 * @returns {Object} The tile coordinates of the object stored in the
 *                   specified point of the map.
 */
RM.Frame.prototype.getTile = function (p) {
  'use strict';
  var i, mp;
  for (i = 1; i < arguments.length; i += 1) {
    p += ',' + arguments[i];
  }
  for (i = 2; i >= 0; i -= 1) {
    mp = this.content.map.getPoint(p + ',' + i);
    if (mp) {
      return mp.tile;
    }
  }
  return this.content.empty;
};
