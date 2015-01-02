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
 * @param {Object} content.map    The 2-dimensional array of graphical data.
 * @param {String} content.color  The background color of the content in hexa.
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
  this.clickListeners = [];
  window.addEventListener('click', this);
  window.addEventListener('mousemove', this);
};

RM.Frame.prototype.handleMessage = function (message, publisher, data) {
  'use strict';
  switch (message) {
  case 'FOVupdate':
    this.content.map = publisher.fov;
    this.content.x = publisher.x - 10;
    this.content.y = publisher.y - 10;
    this.redraw();
    break;
  }
};

RM.Frame.prototype.redraw = function () {
  'use strict';
  var x, y, tile;
  RM.c.fillStyle = this.content.color;
  RM.c.fillRect(this.x, this.y, this.width, this.height);
  for (x = 0; x < this.content.map.length; x += 1) {
    for (y = 0; y < this.content.map[x].length; y += 1) {
      tile = this.content.map[x][y];
      RM.c.drawImage(RM.tileset, tile.x, tile.y, 24, 21,
                    this.x + x * this.content.width,
                    this.y + y * this.content.height,
                    this.content.width,
                    this.content.height);
    }
  }
};

RM.Frame.prototype.handleEvent = function (e) {
  'use strict';
  var canvas, x, y;
  canvas = RM.canvas.getBoundingClientRect();
  x = Math.floor(e.clientX - canvas.left - this.x + this.content.x)
    / this.content.width;
  y = Math.floor(e.clientY - canvas.top - this.y + this.content.y)
    / this.content.height;
  if (x > 0 && y > 0 && x < this.width && y < this.height) {
    RM.publish(e.type, this, {
      x: x,
      y: y
    });
  }
};
