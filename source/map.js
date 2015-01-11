/*global RM, ROT*/
/**
 * A class to store multi-dimensional data.
 * @constructor
 */
RM.Map = function () {
  'use strict';
  this.points = {};
  this.shadowcasting =
    new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));
};

/**
 * Stores a custom data in an arbitrarily defined point of the map.
 * @param   {Object} data The object to store.
 * @param   {String} p    The coordinates of the point separated with commas,
 *                        or the first coordinate of the point, followed by the
 *                        others as additional arguments.
 */
RM.Map.prototype.setPoint = function (data, p) {
  'use strict';
  var i;
  for (i = 2; i < arguments.length; i += 1) {
    p += ',' + arguments[i];
  }
  this.points[p] = data;
};

/**
 * Returns the data stored in an arbitrarily defined point of the map.
 * @param   {String} p The coordinates of the point separated with commas,
 *                   or the first coordinate of the point, followed by the
 *                   others as additional arguments.
 * @returns {Object} The object stored in the specified point of the map.
 */
RM.Map.prototype.getPoint = function (p) {
  'use strict';
  var i;
  for (i = 1; i < arguments.length; i += 1) {
    p += ',' + arguments[i];
  }
  return this.points[p];
};



RM.Map.prototype.isPlayer = function (x, y) {
  'use strict';
  var actor = this.getPoint(x, y, RM.ACTOR);
  return actor ? !actor.ai : false;
};

RM.Map.prototype.isTransparent = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y, 0);
  return point ? point.transparent : false;
};

RM.Map.prototype.isPassable = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y, 0);
  return point ? point.passable : false;
};

RM.Map.prototype.move = function (point1, point2, map2) {
  'use strict';
  map2 = map2 || this;
  map2.setPoint(this.getPoint(point1), point2);
  this.setPoint(null, point1);
};
