/*global RM,ROT*/
/**
 * A region of the game window to display parts of 2-dimensional graphical data
 * maps in different sizes, and pass on window events.
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
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.content = content;
  this.clickListeners = [];
  window.addEventListener('click', this);
  window.addEventListener('mousemove', this);
};

RM.Frame.prototype.addClickListener = function (clickListener) {
  'use strict';
};

RM.Frame.prototype.notifyClickListeners = function (e) {
  'use strict';
  var i, clickListener;
  for (i = 0; i < this.clickListeners.length; i += 1) {
    clickListener = this.clickListeners[i];
    clickListener(e);
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
    if (e.type === 'click') {
      this.notifyClickListeners({
        x: x,
        y: y
      });
    }
  }
};
