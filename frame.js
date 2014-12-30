/*global RM,ROT*/
/**
 * A region of the game window to display parts of 2-dimensional graphical data
 * maps in different sizes, and pass on window events.
 * @param {String} name           The identifier of the frame that is passed on
 *                                when events occur.
 * @param {Number} x              The x coordinate of the left border.
 * @param {Number} y              The y coordinate of the top border.
 * @param {Number} width          The width of the frame.
 * @param {Number} height         The height of the frame.
 * @param {Object} content        The content to display.
 * @param {Number} content.x      The x offset of the content.
 * @param {Number} content.y      The y offset of the content.
 * @param {Number} content.width  The width of content's part to display.
 * @param {Number} content.height The height of content's part to display.
 */
RM.Frame = function (name, x, y, width, height, content) {
  'use strict';
  this.name = name;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.content = content;
  this.listener = null;
  window.addEventListener('click', this);
  window.addEventListener('mousemove', this);
};

RM.Frame.prototype.handleEvent = function (e) {
  'use strict';
  var c, x, y;
  if (!this.listener) {
    return false;
  }
  c = RM.canvas.getBoundingClientRect();
  x = e.clientX - c.left - this.x - this.cx;
  y = e.clientY - c.top - this.y - this.cy;
  if (x > 0 && y > 0 && x < this.width && y < this.height) {
    this.listener.handleEvent({
      name: this.name,
      type: e.type,
      x: x,
      y: y
    });
  }
};
