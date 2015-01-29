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
  this.init(x, y, width, height, background, content, handler);
};
RM.Frame.extend(RM.UIObject);
RM.Frame.prototype.superInit = RM.UIObject.prototype.init;

RM.Frame.prototype.init = function (x,
                                    y,
                                    width,
                                    height,
                                    background,
                                    content,
                                    handler) {
  'use strict';
  this.superInit(x, y, width, height, background);
  this.content = content;
  this.handler = handler;
};

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
  var tile, i, content;
  content = this.content();
  this.drawBackground();
  for (i = 0; i < content.length; i += 1) {
    tile = content[i].tile;
    if (tile) {
      this.drawTile(tile, content[i].x, content[i].y);
    }
  }
};

RM.Frame.prototype.drawTile = function (tile, x, y) {
  'use strict';
  RM.c.drawImage(RM.tileSet,
                 tile.x,
                 tile.y,
                 RM.tile.width,
                 RM.tile.height,
                 RM.tile.width * x + this.x,
                 RM.tile.height * y + this.y,
                 RM.tile.width,
                 RM.tile.height);
};

