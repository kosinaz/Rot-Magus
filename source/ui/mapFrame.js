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
RM.MapFrame = function (x, y, width, height, background, content, handler) {
  'use strict';
  this.init(x, y, width, height, background, content, handler);
};
RM.MapFrame.extend(RM.Frame);
RM.MapFrame.prototype.superInit = RM.Frame.prototype.init;

RM.MapFrame.prototype.init = function (x,
                                       y,
                                       width,
                                       height,
                                       background,
                                       content,
                                       handler) {
  'use strict';
  this.superInit(x, y, width, height, background, content, handler);
};
