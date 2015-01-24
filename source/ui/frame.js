/*global RM,ROT*/
/**
 * A region of the game window to display parts of 2-dimensional graphical data
 * maps in different sizes, and pass on window events.
 * @param {Number}   x          The x coordinate of the left border.
 * @param {Number}   y          The y coordinate of the top border.
 * @param {Number}   width      The width of the frame.
 * @param {Number}   height     The height of the frame.
 * @param {[[Type]]} background [[Description]]
 * @param {Object}   content    [[Description]]
 * @param {[[Type]]} handler    [[Description]]
 */
RM.Frame = function (x, y, width, height, background, content, handler) {
  'use strict';
  var xb, yb;
  this.init(x, y, width, height, background);
  this.content = content;
  this.handler = handler;
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
    x = Math.floor((RM.mouse.x - this.x) / RM.tile.width);
    y = Math.floor((RM.mouse.y - this.y) / RM.tile.height);
    this.handler(x, y);
  }
};

RM.Frame.prototype.draw = function () {
  'use strict';
  var tile, i, s, content;
  content = this.content();
  this.drawBackground();
  for (i = 0; i < content.length; i += 1) {
    tile = content[i].tile;
    if (tile) {
      RM.c.drawImage(RM.tileSet,
                     tile.x,
                     tile.y,
                     RM.tile.width,
                     RM.tile.height,
                     RM.tile.width * content[i].x + this.x,
                     RM.tile.height * content[i].y + this.y,
                     RM.tile.width,
                     RM.tile.height);
      for (s in this.selected) {
        if (this.selected.hasOwnProperty(s)) {
          if (this.selected[s] &&
              this.selected[s].x === content[i].x &&
              this.selected[s].y === content[i].y) {
            tile = this.selected[i].tile;
            RM.c.drawImage(RM.tileSet,
                           tile.x,
                           tile.y,
                           RM.tile.width,
                           RM.tile.height,
                           RM.tile.width * content[s].x + this.x,
                           RM.tile.height * content[s].y + this.y,
                           RM.tile.width,
                           RM.tile.height);
          }
        }
      }
    }
  }
};

RM.Frame.prototype.isSelected = function (category, target) {
  'use strict';
  return this.selected[category] &&
    this.selected[category].x === target.x &&
    this.selected[category].y === target.y;
};


